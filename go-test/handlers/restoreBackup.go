package handlers

import (
	"fmt"
	"log"
	"net/http"
	"os/exec"
	"strings"
	"time"
)

// HandleBackupRestore はバックアップファイル(.qcow2)からVMを復元します
// 対応: ZFS, LVM, NFS (qcow2/raw)
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

	// ステップ1: VM停止 (書き込み中に動いているとデータ破損するため)
	// エラーは無視（既に停止している可能性があるため）
	execCommand("qm", "stop", req.VMID)
	time.Sleep(3 * time.Second) // 停止待ち

	// ステップ2: 書き戻し先の物理パスを特定
	// 例: local-zfs:vm-100-disk-0 -> /dev/zvol/rpool/data/vm-100-disk-0
	out, err := exec.Command("pvesm", "path", req.TargetVolumeID).Output()
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to resolve target volume path: %v", err))
		// パス解決失敗時は、念の為VMを起動し直してあげる優しさ
		execCommand("qm", "start", req.VMID)
		return
	}
	targetPath := strings.TrimSpace(string(out))

	// ステップ3: 書き込みフォーマットの決定
	// ZFSやLVMなどのブロックデバイスは必ず "raw" 形式でデータを受け取る必要がある
	// NFS上の .qcow2 ファイルなら "qcow2" 形式にする
	outputFormat := "raw" // デフォルトはRaw (ZFS/LVM用)
	if strings.HasSuffix(targetPath, ".qcow2") {
		outputFormat = "qcow2"
	}

	log.Printf("[RESTORE] Restoring %s to %s (Format: %s)...", req.BackupPath, targetPath, outputFormat)

	// ステップ4: qemu-img で書き戻し
	// -p: 進捗表示
	// -n: ターゲットボリュームの作成をスキップ (Proxmoxが既に作っている枠の中に書き込むため)
	// -O: 出力フォーマット
	// 引数順序: qemu-img convert [オプション] 入力ファイル 出力ファイル
	cmd := exec.Command("qemu-img", "convert", "-p", "-n", "-O", outputFormat, req.BackupPath, targetPath)
	
	// 出力バッファを繋いでログに出す（デバッグ用）
	if output, err := cmd.CombinedOutput(); err != nil {
		log.Printf("[ERROR] Restore failed: %s", string(output))
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to restore backup: %v", err))
		// 失敗してもVM起動を試みる
		execCommand("qm", "start", req.VMID)
		return
	}

	// ステップ5: VM起動
	if err := execCommand("qm", "start", req.VMID); err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Restore successful but failed to start VM: %v", err))
		return
	}

	respondWithSuccess(w, fmt.Sprintf("VM %s restored and started successfully", req.VMID), map[string]string{
		"target_path": targetPath,
		"format":      outputFormat,
	})
}