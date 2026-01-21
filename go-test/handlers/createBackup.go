package handlers

import (
	"fmt"
	"net/http"
)

func HandleBackupCreate(w http.ResponseWriter, r *http.Request) {
	var req BackupRequest
	if err := parseJSONRequest(r, &req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}
	// ストレージを指定してバックアップを作成
	backupFile := fmt.Sprintf("/var/backups/vm-%s-backup.dd", req.VMID)
	if err := execCommand("dd", "if=/dev/pve/vm-"+req.VMID+"-disk-0", "of="+backupFile, "bs=1M"); err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to create backup: %s", err))
		return
	}

	respondWithJSON(w, http.StatusOK, BaseResponse{
		Status:  "success",
		Message: "Backup created successfully",
	})
}