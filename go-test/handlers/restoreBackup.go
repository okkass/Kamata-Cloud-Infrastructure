package handlers

import (
	"fmt"
	"log"
	"net/http"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
)

func HandleBackupRestore(w http.ResponseWriter, r *http.Request) {
	if !validateHTTPMethod(w, r, http.MethodPost) {
		return
	}

	var req RestoreRequest
	if err := parseJSONRequest(r, &req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	// バリデーション
	if req.VMID == "" || req.BackupStorageID == "" || req.BackupFilename == "" || req.TargetVolumeID == "" {
		respondWithError(w, http.StatusBadRequest, "vmid, backup_storage_id, backup_filename, and target_volume_id are required")
		return
	}

	// ---------------------------------------------------------
	// Step 1: バックアップファイルのパス解決
	// ---------------------------------------------------------
	backupPath := filepath.Join("/mnt/pve", req.BackupStorageID, req.BackupFilename)
	log.Printf("[RESTORE] Source Backup Path resolved to: %s", backupPath)

	// ---------------------------------------------------------
	// Step 2: 書き戻し先の物理パス解決 (pvesm path)
	// ---------------------------------------------------------
	out, err := exec.Command("pvesm", "path", req.TargetVolumeID).Output()
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to resolve target volume path: %v", err))
		return
	}
	targetPath := strings.TrimSpace(string(out))

	// ---------------------------------------------------------
	// Step 3: VM停止
	// ---------------------------------------------------------
	execCommand("qm", "stop", req.VMID)
	time.Sleep(3 * time.Second)

	// ---------------------------------------------------------
	// Step 4: qemu-img で書き戻し
	// ---------------------------------------------------------
	outputFormat := "raw"
	if strings.HasSuffix(targetPath, ".qcow2") {
		outputFormat = "qcow2"
	}

	log.Printf("[RESTORE] Restoring %s -> %s (Format: %s)...", backupPath, targetPath, outputFormat)

	// qemu-img は直接 exec.Command で実行（出力フラッシングが重要）
	cmd := exec.Command("qemu-img", "convert", "-p", "-n", "-O", outputFormat, backupPath, targetPath)
	if output, err := cmd.CombinedOutput(); err != nil {
		log.Printf("[ERROR] Restore failed: %s", string(output))
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to restore backup: %v", err))
		execCommand("qm", "start", req.VMID) // 失敗時も起動を試みる
		return
	}

	// ---------------------------------------------------------
	// Step 5: VM起動
	// ---------------------------------------------------------
	if err := execCommand("qm", "start", req.VMID); err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Restore successful but failed to start VM: %v", err))
		return
	}

	respondWithSuccess(w, fmt.Sprintf("VM %s restored and started successfully", req.VMID), map[string]string{
		"source":      backupPath,
		"destination": targetPath,
	})
}