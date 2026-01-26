package handlers

import (
	"fmt"
	"net/http"
	"os/exec"
	"strings"
	"time"
)

// HandleBackupRestore はバックアップファイルからVMを復元します
// リクエスト: RestoreRequest (vmid, backup_path, target_volume_id)
// 処理: VM停止 → dd で書き戻し → VM起動
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
	if req.VMID == "" || req.BackupPath == "" || req.TargetVolumeID == "" {
		respondWithError(w, http.StatusBadRequest, "vmid, backup_path, and target_volume_id are required")
		return
	}

	// ステップ1: VM停止
	execCommand("qm", "stop", req.VMID) // エラーは無視（既に停止している可能性）
	time.Sleep(3 * time.Second)

	// ステップ2: 書き戻し先の物理パスを特定
	out, err := exec.Command("pvesm", "path", req.TargetVolumeID).Output()
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to resolve volume path: %v", err))
		execCommand("qm", "start", req.VMID) // エラー時もVM起動試行
		return
	}
	targetDevicePath := strings.TrimSpace(string(out))

	// ステップ3: dd で書き戻し
	if err := execCommand("dd", fmt.Sprintf("if=%s", req.BackupPath), fmt.Sprintf("of=%s", targetDevicePath), "bs=1M", "status=progress"); err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to restore backup: %v", err))
		return
	}

	// ステップ4: VM起動
	if err := execCommand("qm", "start", req.VMID); err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Restore successful but failed to start VM: %v", err))
		return
	}

	respondWithSuccess(w, fmt.Sprintf("VM %s restored and started successfully", req.VMID), nil)
}