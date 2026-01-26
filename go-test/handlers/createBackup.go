package handlers

import (
	"fmt"
	"net/http"
	"os/exec"
	"path/filepath"
	"strings"
)

func HandleBackupCreate(w http.ResponseWriter, r *http.Request) {
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

	// ---------------------------------------------------------
	// 1. ソースの物理パスを特定
	// ---------------------------------------------------------
	srcPathBytes, err := exec.Command("pvesm", "path", req.SourceVolumeID).Output()
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Source volume not found")
		return
	}
	srcPath := strings.TrimSpace(string(srcPathBytes))
	// LVMパスの例: /dev/pve/vm-105-disk-0

	// 【重要】これがLVMデバイスか簡易チェック
	if !strings.HasPrefix(srcPath, "/dev/") {
		respondWithError(w, http.StatusBadRequest, "Source is not a device path (LVM required)")
		return
	}

	// ---------------------------------------------------------
	// 2. ボリュームグループ(VG)名の抽出
	// ---------------------------------------------------------
	// パス /dev/pve/vm-105-disk-0 から "pve" を抜き出す必要があります
	parts := strings.Split(srcPath, "/")
	if len(parts) < 4 {
		respondWithError(w, http.StatusInternalServerError, "Could not parse volume group name from path")
		return
	}
	vgName := parts[2] // ["", "dev", "pve", "vm..."] -> "pve"

	// ---------------------------------------------------------
	// 3. LVMスナップショット作成
	// ---------------------------------------------------------
	snapName := fmt.Sprintf("snap-tmp-%s", req.VMID)
	snapPath := fmt.Sprintf("/dev/%s/%s", vgName, snapName)

	// コマンド: lvcreate -s -n <snapName> -L 1G <srcPath>
	// ※ -L 1G は変更差分用。バックアップ中に1GB以上書き込みがあると壊れるので注意。
	// 必要に応じてサイズを大きくするロジックを入れても良い。
	if err := execCommand("lvcreate", "-s", "-n", snapName, "-L", "1G", srcPath); err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to create snapshot: %v", err))
		return
	}

	// 【超重要】関数の終了時に必ずスナップショットを削除する (Defer)
	// 成功してもエラーで途中離脱しても、ここは必ず実行される
	defer func() {
		fmt.Printf("Cleaning up snapshot %s...\n", snapPath)
		// lvremove -f <snapPath>
		_ = execCommand("lvremove", "-f", snapPath)
	}()

	// ---------------------------------------------------------
	// 4. 保存先パスの特定
	// ---------------------------------------------------------
	destRootBytes, err := exec.Command("pvesm", "path", req.DestStorageID).Output()
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Destination storage not found")
		return
	}
	destPath := filepath.Join(strings.TrimSpace(string(destRootBytes)), req.DestFilename)

	// ---------------------------------------------------------
	// 5. DD実行 (スナップショットから読み出す)
	// ---------------------------------------------------------
	// if=srcPath ではなく if=snapPath を使う！
	fmt.Printf("Backing up from snapshot %s to %s...\n", snapPath, destPath)
	
	if err := execCommand("dd", "if="+snapPath, "of="+destPath, "bs=4M", "status=none"); err != nil {
		respondWithError(w, http.StatusInternalServerError, "Copy failed: "+err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, BaseResponse{
		Status:  "success",
		Message: "Backup created successfully from snapshot",
	})
}