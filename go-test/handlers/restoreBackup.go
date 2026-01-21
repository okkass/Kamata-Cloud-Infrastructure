package handlers

import (
	"fmt"
	"net/http"
)

func HandleBackupRestore(w http.ResponseWriter, r *http.Request) {
	var req RestoreRequest
	if err := parseJSONRequest(r, &req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	backupFile := fmt.Sprintf("/var/backups/vm-%s-backup.dd", req.VMID)
	if err := execCommand("dd", "if="+backupFile, "of=/dev/pve/vm-"+req.VMID+"-disk-0", "bs=1M"); err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to restore backup: %s", err))
		return
	}

	respondWithJSON(w, http.StatusOK, BaseResponse{
		Status:  "success",
		Message: "Backup restored successfully",
	})
}
