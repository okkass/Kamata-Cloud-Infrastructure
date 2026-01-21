package handlers

import (
	"fmt"
	"log"
	"net/http"
	"os"
)

func HandleCreateVM(w http.ResponseWriter, r *http.Request) {
	var req VMCreateRequest
	if err := parseJSONRequest(r, &req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	// 1. SSH鍵の一時ファイル作成
	// ---------------------------------------------------------
	var sshKeyPath string
	if req.SSHKey != "" {
		tmpFile, err := os.CreateTemp("", "sshkey-*.pub")
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to create temp key file")
			return
		}
		defer os.Remove(tmpFile.Name()) // 処理終了後に削除

		if _, err := tmpFile.WriteString(req.SSHKey); err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to write ssh key")
			return
		}
		tmpFile.Close()
		sshKeyPath = tmpFile.Name()
	}

	// 2. ベースクローンの実行 (qm clone)
	// ---------------------------------------------------------
	// 基本的にはDisk[0]のストレージ指定があればここで使う
	// PVEの仕様上、テンプレートのディスク(scsi0)がクローンされる
	cloneArgs := []string{"clone", req.SourceVMID, req.NewVMID, "--name", req.NewName}

	// ルートディスク(Disks[0])のストレージ指定があれば適用
	if len(req.Disks) > 0 && req.Disks[0].Storage != "" {
		cloneArgs = append(cloneArgs, "--target", req.Disks[0].Storage)
		cloneArgs = append(cloneArgs, "--full") // ストレージ指定時はFull Clone必須
	}

	if err := execCommand("qm", cloneArgs...); err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to clone VM: %s", err))
		return
	}

	// 3. 設定変更のコマンド構築 (qm set)
	// ---------------------------------------------------------
	// 何度もAPIを叩くと遅いので、可能な限り1回の `qm set` にまとめる
	setArgs := []string{"set", req.NewVMID}

	// CPU / Memory
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

	// ネットワーク & Cloud-Init設定
	for i, net := range req.Networks {
		// --- NIC設定 (net0, net1...) ---
		// 基本: virtio,bridge=vmbr0
		netConfig := fmt.Sprintf("%s,bridge=%s", net.Model, net.Bridge)

		// MACアドレス指定がある場合 (DHCP固定割り当て用)
		if net.MacAddress != "" {
			netConfig += fmt.Sprintf(",macaddr=%s", net.MacAddress)
		}

		setArgs = append(setArgs, fmt.Sprintf("--net%d", i), netConfig)

		// --- Cloud-Init IP設定 (ipconfig0, ipconfig1...) ---
		var ipConfig string

		if net.IPAddress != "" {
			// 固定IP指定がある場合: ip=192.168.1.50/24,gw=192.168.1.1
			ipConfig = fmt.Sprintf("ip=%s", net.IPAddress)
			if net.Gateway != "" {
				ipConfig += fmt.Sprintf(",gw=%s", net.Gateway)
			}
		} else {
			// 指定がない場合: DHCPモード
			// これにしておけば、MACアドレスに基づいたIPがルーターから降ってきます
			ipConfig = "ip=dhcp"
		}

		setArgs = append(setArgs, fmt.Sprintf("--ipconfig%d", i), ipConfig)
	}

	// 設定適用実行
	if len(setArgs) > 2 { // "set", "vmid" 以外に引数がある場合
		if err := execCommand("qm", setArgs...); err != nil {
			respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to configure VM: %s", err))
			return
		}
	}

	// 4. ディスクの調整 (Resize & Create)
	// ---------------------------------------------------------
	// ディスク操作は `qm set` で一括にできない場合が多いので個別に処理します

	for i, disk := range req.Disks {
		// Disk[0] はテンプレートから継承したルートディスクとみなしてリサイズのみ行う
		// (ストレージ移動はclone時に実施済み)
		if i == 0 {
			// サイズ指定があり、かつ "+" (増分) または絶対値指定の場合
			if disk.Size != "" {
				// qm resize <vmid> <disk> <size>
				if err := execCommand("qm", "resize", req.NewVMID, disk.Device, disk.Size); err != nil {
					log.Printf("[WARN] Failed to resize root disk: %s", err)
				}
			}
			continue
		}

		// Disk[1] 以降は新規ディスク追加
		// qm set <vmid> --scsi1 storage:size
		// 例: local-zfs:50G
		storageSize := fmt.Sprintf("%s:%s", disk.Storage, disk.Size)
		if err := execCommand("qm", "set", req.NewVMID, fmt.Sprintf("--%s", disk.Device), storageSize); err != nil {
			log.Printf("[WARN] Failed to add disk %s: %s", disk.Device, err)
			respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to add disk %s", disk.Device))
			return
		}
	}

	// 6. 起動
	// ---------------------------------------------------------
	if err := execCommand("qm", "start", req.NewVMID); err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to start VM: %s", err))
		return
	}

	respondWithJSON(w, http.StatusOK, BaseResponse{
		Status:  "success",
		Message: fmt.Sprintf("VM %s created successfully", req.NewVMID),
	})
}