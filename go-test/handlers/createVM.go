package handlers

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

// VMCreateRequest に SnippetStorage を追加
type VMCreateRequest struct {
	SourceVMID      string          `json:"source_vmid"`
	NewVMID         string          `json:"new_vmid"`
	NewName         string          `json:"new_name"`
	TargetNode      string          `json:"target_node"`
	SnippetStorage  string          `json:"snippet_storage"` // ★追加: スニペット保存先ストレージID
	Cores           int             `json:"cores"`
	Memory          int             `json:"memory"`
	Disks           []DiskConfig    `json:"disks"`
	Networks        []NetworkConfig `json:"networks"`
	InstallPackages []string        `json:"install_packages"`
	SSHKey          string          `json:"ssh_key"`
	FullClone       bool            `json:"full_clone"`
}

func HandleCreateVM(w http.ResponseWriter, r *http.Request) {
	if !validateHTTPMethod(w, r, http.MethodPost) {
		return
	}

	var req VMCreateRequest
	if err := parseJSONRequest(r, &req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if req.SourceVMID == "" || req.NewVMID == "" || req.NewName == "" {
		respondWithError(w, http.StatusBadRequest, "source_vmid, new_vmid, and new_name are required")
		return
	}

	// ---------------------------------------------------------
	// Step 1: Cloud-Init (user-data) ファイルの作成
	// ---------------------------------------------------------

	// ★修正: リクエストで指定があればそれを使い、なければデフォルト(local-lvm)を使う
	targetStorageID := req.SnippetStorage
	if targetStorageID == "" {
		// デフォルト値 (環境変数で変えられるようにしても良いですが、一旦ハードコードでfallback)
		targetStorageID = "local-lvm"
	}

	log.Printf("[INFO] Creating Cloud-Init snippet on storage: %s", targetStorageID)

	snippetFilePath, proxmoxVolID, err := createSharedUserData(req.NewVMID, req.InstallPackages, req.SSHKey, targetStorageID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to create user-data on shared storage (%s): %v", targetStorageID, err))
		return
	}

	// cleanup関数
	cleanup := func() {
		log.Printf("[ROLLBACK] Cleaning up VM %s and snippet...", req.NewVMID)
		// VM削除 (他ノードにある場合も考慮して本来はSSH等が必要だが、とりあえずローカルコマンド)
		execCommand("qm", "destroy", req.NewVMID)
		// ファイル削除
		os.Remove(snippetFilePath)
	}

	// 引数用に整形: user=<storage:path>
	cicustomArg := fmt.Sprintf("user=%s", proxmoxVolID)

	// ---------------------------------------------------------
	// Step 2: VMクローン (ターゲット指定)
	// ---------------------------------------------------------
	cloneArgs := []string{"clone", req.SourceVMID, req.NewVMID, "--name", req.NewName}

	if req.TargetNode != "" {
		cloneArgs = append(cloneArgs, "--target", req.TargetNode)
	}

	// ディスク保存先の指定
	// もしVM本体のディスクも同じストレージに入れたい場合は、req.Disks[0].Storage を使う
	if len(req.Disks) > 0 && req.Disks[0].Storage != "" {
		cloneArgs = append(cloneArgs, "--storage", req.Disks[0].Storage)
	}

	if req.FullClone {
		cloneArgs = append(cloneArgs, "--full", "1", "--format", "qcow2")
	} else {
		cloneArgs = append(cloneArgs, "--full", "0")
	}

	if err := execCommand("qm", cloneArgs...); err != nil {
		os.Remove(snippetFilePath) // ファイルだけは確実に消す
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to clone VM: %v", err))
		return
	}

	// ---------------------------------------------------------
	// Step 3: 設定適用 (qm set)
	// ---------------------------------------------------------
	setArgs := []string{"set", req.NewVMID}
	setArgs = append(setArgs, "--cicustom", cicustomArg)
	setArgs = append(setArgs, "--agent", "1")

	if req.Cores > 0 {
		setArgs = append(setArgs, "--cores", fmt.Sprintf("%d", req.Cores))
	}
	if req.Memory > 0 {
		setArgs = append(setArgs, "--memory", fmt.Sprintf("%d", req.Memory))
	}

	// Network & IP
	for i, net := range req.Networks {
		netConfig := fmt.Sprintf("%s,bridge=%s", net.Model, net.Bridge)
		if net.MacAddress != "" {
			netConfig += fmt.Sprintf(",macaddr=%s", net.MacAddress)
		}
		setArgs = append(setArgs, fmt.Sprintf("--net%d", i), netConfig)

		var ipConfig string
		if net.IPAddress != "" {
			ipConfig = fmt.Sprintf("ip=%s", net.IPAddress)
			if net.Gateway != "" {
				ipConfig += fmt.Sprintf(",gw=%s", net.Gateway)
			}
		} else {
			ipConfig = "ip=dhcp"
		}
		setArgs = append(setArgs, fmt.Sprintf("--ipconfig%d", i), ipConfig)
	}

	if err := execCommand("qm", setArgs...); err != nil {
		cleanup()
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to configure VM: %v", err))
		return
	}

	// ---------------------------------------------------------
	// Step 4: ディスクリサイズ & 起動
	// ---------------------------------------------------------
	for i, disk := range req.Disks {
		if i == 0 && disk.Size != "" {
			execCommand("qm", "resize", req.NewVMID, disk.Device, disk.Size)
		} else if i > 0 && disk.Storage != "" && disk.Size != "" {
			storageSize := fmt.Sprintf("%s:%s", disk.Storage, disk.Size)
			execCommand("qm", "set", req.NewVMID, fmt.Sprintf("--%s", disk.Device), storageSize)
		}
	}

	if err := execCommand("qm", "start", req.NewVMID); err != nil {
		cleanup()
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to start VM: %v", err))
		return
	}

	// レスポンスに保存先ストレージも含めておくと親切
	respondWithSuccess(w, fmt.Sprintf("VM %s created on node %s (snippet: %s)", req.NewVMID, req.TargetNode, targetStorageID), nil)
}

// createSharedUserData は変更なし（引数で storageID を受け取るようになっているため）
func createSharedUserData(vmid string, packages []string, sshKey string, storageID string) (string, string, error) {
	// 共有ストレージのパス解決
	// 基本的に /mnt/pve/<StorageID> にあると仮定
	baseDir := filepath.Join("/mnt/pve", storageID, "snippets")

	if _, err := os.Stat(baseDir); os.IsNotExist(err) {
		if err := os.MkdirAll(baseDir, 0755); err != nil {
			return "", "", err
		}
	}

	fileName := fmt.Sprintf("user-data-%s.yml", vmid)
	filePath := filepath.Join(baseDir, fileName)

	// 内容生成
	var sb strings.Builder
	sb.WriteString("#cloud-config\n")
	sb.WriteString("package_update: true\n")
	sb.WriteString("package_upgrade: true\n")

	if len(packages) > 0 {
		sb.WriteString("packages:\n")
		for _, pkg := range packages {
			sb.WriteString(fmt.Sprintf("  - %s\n", pkg))
		}
	}

	if sshKey != "" {
		sb.WriteString("ssh_authorized_keys:\n")
		sb.WriteString(fmt.Sprintf("  - %s\n", sshKey))
	}

	sb.WriteString("runcmd:\n")
	sb.WriteString("  - systemctl enable --now qemu-guest-agent || true\n")

	// 追加のパッケージ用設定など
	for _, pkg := range packages {
		if pkg == "nginx" {
			sb.WriteString("  - systemctl enable --now nginx\n")
		}
	}

	if err := os.WriteFile(filePath, []byte(sb.String()), 0644); err != nil {
		return "", "", err
	}

	// ProxmoxボリュームIDを返す
	proxmoxVolID := fmt.Sprintf("%s:snippets/%s", storageID, fileName)

	return filePath, proxmoxVolID, nil
}
