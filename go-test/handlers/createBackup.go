package handlers

import (
	"fmt"
	"log"
	"net/http"
	"os/exec"
	"path/filepath"
	"strings"
)

// HandleBackupCreate はVMのディスクを圧縮バックアップ(qcow2)として抽出します
// 対応: ZFS, LVM, NFS (File)
// 処理: スナップショット作成(ZFS/LVMのみ) → qemu-img convert(圧縮) → スナップショット削除
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

	// ステップ1: ソースの物理パスを特定
	srcPathBytes, err := exec.Command("pvesm", "path", req.SourceVolumeID).Output()
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Source volume not found")
		return
	}
	srcPath := strings.TrimSpace(string(srcPathBytes))

	// ステップ2: ストレージタイプの判定とスナップショット作成
	var readPath string
	var cleanupFunc func()

	// 判定ロジック (ZFSは /dev/zvol/, LVMはそれ以外の /dev/)
	isZFS := strings.HasPrefix(srcPath, "/dev/zvol/")
	isLVM := strings.HasPrefix(srcPath, "/dev/") && !isZFS

	if isZFS {
		// --- ZFS パターン ---
		dataset := strings.TrimPrefix(srcPath, "/dev/zvol/")
		snapName := fmt.Sprintf("snap-backup-%s", req.VMID)
		
		// スナップショット作成
		if err := execCommand("zfs", "snapshot", fmt.Sprintf("%s@%s", dataset, snapName)); err != nil {
			respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to create ZFS snapshot: %v", err))
			return
		}

		// 読み取り元: スナップショットのパス
		readPath = fmt.Sprintf("/dev/zvol/%s@%s", dataset, snapName)
		cleanupFunc = func() {
			log.Printf("[CLEANUP] Destroying ZFS snapshot %s@%s...", dataset, snapName)
			execCommand("zfs", "destroy", fmt.Sprintf("%s@%s", dataset, snapName))
		}

	} else if isLVM {
		// --- LVM パターン ---
		parts := strings.Split(srcPath, "/")
		if len(parts) < 3 {
			respondWithError(w, http.StatusInternalServerError, "Invalid LVM path")
			return
		}
		vgName := parts[2] // 例: /dev/pve/vm-100-disk-0 -> pve
		snapName := fmt.Sprintf("snap-backup-%s", req.VMID)

		// LVMスナップショット作成 (-s:snapshot, -L:サイズ)
		if err := execCommand("lvcreate", "-s", "-n", snapName, "-L", "1G", srcPath); err != nil {
			respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to create LVM snapshot: %v", err))
			return
		}

		readPath = fmt.Sprintf("/dev/%s/%s", vgName, snapName)
		cleanupFunc = func() {
			log.Printf("[CLEANUP] Removing LVM snapshot %s...", readPath)
			execCommand("lvremove", "-f", readPath)
		}

	} else {
		// --- File パターン (NFS, Local Directory) ---
		// スナップショットは作らず、直接ファイルを読み込む
		log.Printf("[INFO] Detected file-based storage. Reading directly from: %s", srcPath)
		readPath = srcPath
		cleanupFunc = func() {}
	}

	// 関数終了時に必ずスナップショットを削除
	defer cleanupFunc()

	// ステップ3: 出力パス決定 (必ず .qcow2 にする)
	destFilename := req.DestFilename
	if destFilename == "" {
		destFilename = fmt.Sprintf("backup-vm-%s.qcow2", req.VMID)
	} else if !strings.HasSuffix(destFilename, ".qcow2") {
		destFilename += ".qcow2"
	}
	// 保存先パス (例: /mnt/pve/shared-tank-sdb/backup-vm-100.qcow2)
	destPath := filepath.Join("/mnt/pve", req.DestStorageID, destFilename)

	// ステップ4: qemu-img で圧縮バックアップ実行
	// -p: 進捗表示
	// -c: 圧縮 (Compressed)
	// -O qcow2: 出力フォーマット
	log.Printf("Exporting %s to %s (Compressed QCOW2)...", readPath, destPath)
	
	if err := execCommand("qemu-img", "convert", "-p", "-c", "-O", "qcow2", readPath, destPath); err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Export failed: %v", err))
		return
	}

	respondWithSuccess(w, "Compressed backup created successfully", map[string]string{
		"filename": destPath,
		"source":   srcPath,
		"format":   "qcow2 (compressed)",
	})
}