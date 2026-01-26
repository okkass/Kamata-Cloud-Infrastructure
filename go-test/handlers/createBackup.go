package handlers

import (
	"fmt"
	"log"
	"net/http"
	"os/exec"
	"path/filepath"
	"strings"
)

// HandleBackupCreate はVMのディスクをバックアップファイルとして抽出します
// リクエスト: RawDiskExportRequest (vmid, source_volume_id, dest_storage_id, dest_filename)
// 処理: LVMスナップショット作成 → dd でエクスポート → スナップショット削除
// 失敗時: 自動的にスナップショットを削除
func HandleBackupCreate(w http.ResponseWriter, r *http.Request) {
	if !validateHTTPMethod(w, r, http.MethodPost) {
		return
	}

	var req RawDiskExportRequest
	if err := parseJSONRequest(r, &req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	// バリデーション
	if req.VMID == "" || req.SourceVolumeID == "" || req.DestStorageID == "" {
		respondWithError(w, http.StatusBadRequest, "vmid, source_volume_id, and dest_storage_id are required")
		return
	}

	// ステップ1: ソースの物理パスを特定 (pvesm path)
	srcPathBytes, err := exec.Command("pvesm", "path", req.SourceVolumeID).Output()
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Source volume not found")
		return
	}
	srcPath := strings.TrimSpace(string(srcPathBytes))

	// LVMデバイスかチェック
	if !strings.HasPrefix(srcPath, "/dev/") {
		respondWithError(w, http.StatusBadRequest, "Source is not a device path (LVM required)")
		return
	}

	// ステップ2: ボリュームグループ(VG)名を抽出
	parts := strings.Split(srcPath, "/")
	if len(parts) < 4 {
		respondWithError(w, http.StatusInternalServerError, "Could not parse volume group name")
		return
	}
	vgName := parts[2]

	// ステップ3: LVMスナップショット作成
	snapName := fmt.Sprintf("snap-tmp-%s", req.VMID)
	snapPath := fmt.Sprintf("/dev/%s/%s", vgName, snapName)

	// 失敗時のスナップショット自動削除
	defer func() {
		log.Printf("[CLEANUP] Removing snapshot %s...", snapPath)
		execCommand("lvremove", "-f", snapPath)
	}()

	if err := execCommand("lvcreate", "-s", "-n", snapName, "-L", "1G", srcPath); err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to create snapshot: %v", err))
		return
	}

	// ステップ4: 出力パスを決定
	destFilename := req.DestFilename
	if destFilename == "" {
		destFilename = fmt.Sprintf("vm-%s.img", req.VMID)
	}
	destPath := filepath.Join("/mnt", req.DestStorageID, destFilename)

	// ステップ5: dd でエクスポート
	if err := execCommand("dd", fmt.Sprintf("if=%s", snapPath), fmt.Sprintf("of=%s", destPath), "bs=1M", "status=progress"); err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to export disk: %v", err))
		return
	}

	respondWithSuccess(w, "Backup created successfully", map[string]string{
		"filename": destPath,
	})
}