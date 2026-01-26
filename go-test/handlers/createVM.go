package handlers

import (
	"fmt"
	"log"
	"net/http"
	"os"
)

// HandleCreateVM はテンプレートからVMを作成します
// リクエスト: VMCreateRequest (source_vmid, new_vmid, new_name, cores, memory, disks, networks, ssh_key, auto_start)
// 処理: VM クローン → 設定変更 → ディスク設定 → VM 起動
// 失敗時: 自動的に作成されたVMを削除
func HandleCreateVM(w http.ResponseWriter, r *http.Request) {
	if !validateHTTPMethod(w, r, http.MethodPost) {
		return
	}

	var req VMCreateRequest
	if err := parseJSONRequest(r, &req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	// バリデーション
	if req.SourceVMID == "" || req.NewVMID == "" || req.NewName == "" {
		respondWithError(w, http.StatusBadRequest, "source_vmid, new_vmid, and new_name are required")
		return
	}

	// 失敗時の自動ロールバック: VM 削除
	shouldRollback := true
	defer func() {
		if shouldRollback {
			log.Printf("[ROLLBACK] Removing VM %s due to creation failure...", req.NewVMID)
			execCommand("qm", "destroy", req.NewVMID)
		}
	}()

	// ステップ1: SSH鍵の一時ファイル作成
	var sshKeyPath string
	if req.SSHKey != "" {
		tmpFile, err := os.CreateTemp("", "sshkey-*.pub")
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to create temp key file")
			return
		}
		defer os.Remove(tmpFile.Name())

		if _, err := tmpFile.WriteString(req.SSHKey); err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to write ssh key")
			return
		}
		tmpFile.Close()
		sshKeyPath = tmpFile.Name()
	}

	// ステップ2: VMクローン
	cloneArgs := []string{"clone", req.SourceVMID, req.NewVMID, "--name", req.NewName}
	if len(req.Disks) > 0 && req.Disks[0].Storage != "" {
		cloneArgs = append(cloneArgs, "--target", req.Disks[0].Storage, "--full")
	}

	if err := execCommand("qm", cloneArgs...); err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to clone VM: %v", err))
		return
	}

	// ステップ3: 設定変更 (qm set - CPU/Memory/Network/Cloud-Init)
	setArgs := []string{"set", req.NewVMID}

	// CPU / Memory 設定
	if req.Cores > 0 {
		setArgs = append(setArgs, "--cores", fmt.Sprintf("%d", req.Cores))
	}
	if req.Memory > 0 {
		setArgs = append(setArgs, "--memory", fmt.Sprintf("%d", req.Memory))
	}

	// SSH鍵
	if sshKeyPath != "" {
		setArgs = append(setArgs, "--sshkeys", sshKeyPath)
	}

	// ネットワーク & Cloud-Init 設定
	for i, net := range req.Networks {
		// NIC設定
		netConfig := fmt.Sprintf("%s,bridge=%s", net.Model, net.Bridge)
		if net.MacAddress != "" {
			netConfig += fmt.Sprintf(",macaddr=%s", net.MacAddress)
		}
		setArgs = append(setArgs, fmt.Sprintf("--net%d", i), netConfig)

		// Cloud-Init IP設定
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

	// 設定適用
	if len(setArgs) > 2 {
		if err := execCommand("qm", setArgs...); err != nil {
			respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to configure VM: %v", err))
			return
		}
	}

	// ステップ4: ディスク調整
	for i, disk := range req.Disks {
		if i == 0 {
			// ルートディスク: リサイズのみ
			if disk.Size != "" {
				if err := execCommand("qm", "resize", req.NewVMID, disk.Device, disk.Size); err != nil {
					log.Printf("[WARN] Failed to resize root disk: %v", err)
				}
			}
			continue
		}

		// 追加ディスク: 新規作成
		storageSize := fmt.Sprintf("%s:%s", disk.Storage, disk.Size)
		if err := execCommand("qm", "set", req.NewVMID, fmt.Sprintf("--%s", disk.Device), storageSize); err != nil {
			respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to add disk %s: %v", disk.Device, err))
			return
		}
	}

	// ステップ5: VM起動
	if err := execCommand("qm", "start", req.NewVMID); err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to start VM: %v", err))
		return
	}

	// 成功時: ロールバック無効化
	shouldRollback = false

	respondWithSuccess(w, fmt.Sprintf("VM %s created successfully", req.NewVMID), map[string]string{
		"vm_id":  req.NewVMID,
		"name":   req.NewName,
		"status": "running",
	})
}