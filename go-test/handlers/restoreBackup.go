package handlers

import (
	"fmt"
	"net/http"
	"os/exec"
	"strings"
	"time"
)

// リクエスト構造体


func HandleBackupRestore(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
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

	// ---------------------------------------------------------
	// Step 1: VMを停止 (qm stop)
	// ---------------------------------------------------------
	// 既に停止しているかもしれないのでエラーは無視するか、statusを確認する手もあるが
	// 強制的に stop を送って少し待つのがシンプル
	fmt.Printf("Stopping VM %s...\n", req.VMID)
	execCommand("qm", "stop", req.VMID)
	
	// 完全に停止するまで少し待機 (簡易的な実装)
	// 本来は "qm status" をポーリングして "stopped" になるのを待つのがベスト
	time.Sleep(5 * time.Second)

	// ---------------------------------------------------------
	// Step 2: 書き戻し先の物理パスを特定 (pvesm path)
	// ---------------------------------------------------------
	// TargetVolumeID (例: local-lvm:vm-105-disk-0) から /dev/pve/... を引く
	out, err := exec.Command("pvesm", "path", req.TargetVolumeID).Output()
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to resolve volume path: %v", err))
		// 失敗したらVMを起動し直してあげる優しさがあってもいい
		execCommand("qm", "start", req.VMID) 
		return
	}
	targetDevicePath := strings.TrimSpace(string(out))
	fmt.Printf("Target device resolved: %s\n", targetDevicePath)

	// ---------------------------------------------------------
	// Step 3: DDで書き戻し
	// ---------------------------------------------------------
	// dd if=<バックアップファイル> of=<デバイス> bs=1M status=none
	fmt.Printf("Restoring backup from %s to %s...\n", req.BackupPath, targetDevicePath)
	if err := execCommand("dd", "if="+req.BackupPath, "of="+targetDevicePath, "bs=1M", "status=none"); err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to restore backup: %v", err))
		return
	}

	// ---------------------------------------------------------
	// Step 4: VMを起動 (qm start)
	// ---------------------------------------------------------
	fmt.Printf("Starting VM %s...\n", req.VMID)
	if err := execCommand("qm", "start", req.VMID); err != nil {
		// リストアは成功しているが起動に失敗した場合
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Restore successful but failed to start VM: %v", err))
		return
	}

	respondWithJSON(w, http.StatusOK, BaseResponse{
		Status:  "success",
		Message: fmt.Sprintf("VM %s restored and started successfully", req.VMID),
	})
}