package handlers

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

// HandleCreateVM はテンプレートからVMを作成し、Cloud-Init(user-data)ですべての設定を行います
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
	snippetFilePath, err := createFullUserData(req.NewVMID, req.InstallPackages, req.SSHKey)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to create user-data: %v", err))
		return
	}

	// cleanup関数: 失敗時のロールバック
	cleanup := func() {
		log.Printf("[ROLLBACK] Cleaning up VM %s and snippet file %s...", req.NewVMID, snippetFilePath)
		execCommand("qm", "destroy", req.NewVMID)
		os.Remove(snippetFilePath)
	}

	// 引数用に整形: user=<storage:path>
	cicustomArg := fmt.Sprintf("user=%s", snippetFilePath)

	// ---------------------------------------------------------
	// Step 2: VMクローン
	// ---------------------------------------------------------
	cloneArgs := []string{"clone", req.SourceVMID, req.NewVMID, "--name", req.NewName}
	if len(req.Disks) > 0 && req.Disks[0].Storage != "" {
		cloneArgs = append(cloneArgs, "--storage", req.Disks[0].Storage)
	}
	// フルクローン設定
	if req.FullClone {
		cloneArgs = append(cloneArgs, "--full", "1", "--format", "qcow2")
	} else {
		cloneArgs = append(cloneArgs, "--full", "0")
	}

	if err := execCommand("qm", cloneArgs...); err != nil {
		cleanup()
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to clone VM: %v", err))
		return
	}

	// ---------------------------------------------------------
	// Step 3: 設定適用 (qm set)
	// ---------------------------------------------------------
	setArgs := []string{"set", req.NewVMID}
	// Cloud-Init設定
	setArgs = append(setArgs, "--cicustom", cicustomArg)
	setArgs = append(setArgs, "--agent", "1")
	// CPU / Memory
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

	// 適用
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

	respondWithSuccess(w, fmt.Sprintf("VM %s created with full cloud-init config", req.NewVMID), nil)
}

// createFullUserData : パッケージもSSH鍵も全部入りのYAMLを作成
func createFullUserData(vmid string, packages []string, sshKey string) (string, error) {
	snippetDir := "/var/lib/vz/snippets"
	if _, err := os.Stat(snippetDir); os.IsNotExist(err) {
		os.MkdirAll(snippetDir, 0755)
	}

	fileName := fmt.Sprintf("user-data-%s.yml", vmid)
	filePath := filepath.Join(snippetDir, fileName)

	var sb strings.Builder
	sb.WriteString("#cloud-config\n")
	
	// ユーザー設定 (デフォルトユーザーに適用)
	// 必要であればここでユーザー名(user)やパスワード(password)も指定可能です
	
	// 1. パッケージ設定
	sb.WriteString("package_update: true\n")
	sb.WriteString("package_upgrade: true\n")
	if len(packages) > 0 {
		sb.WriteString("packages:\n")
		for _, pkg := range packages {
			sb.WriteString(fmt.Sprintf("  - %s\n", pkg))
		}
	}

	// 2. SSH鍵設定 (ここに入れます！)
	if sshKey != "" {
		sb.WriteString("ssh_authorized_keys:\n")
		sb.WriteString(fmt.Sprintf("  - %s\n", sshKey))
	}

	// 3. コマンド実行 (サービスの有効化など)
	sb.WriteString("runcmd:\n")
	// QEMU Guest Agentはほぼ必須なので、パッケージリストになくても有効化を試みる記述をしておくと親切
	sb.WriteString("  - systemctl enable --now qemu-guest-agent || true\n") 
	
	// Nginxなど特定のパッケージに対する処理
	for _, pkg := range packages {
		if pkg == "nginx" {
			sb.WriteString("  - systemctl enable --now nginx\n")
		}
	}

	if err := os.WriteFile(filePath, []byte(sb.String()), 0644); err != nil {
		return "", err
	}

	// Proxmox上のパス形式 (localストレージ前提)
	return fmt.Sprintf("local:snippets/%s", fileName), nil
}