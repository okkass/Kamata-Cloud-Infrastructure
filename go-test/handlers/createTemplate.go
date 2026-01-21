package handlers

import (
	"fmt"
	"net/http"
	"path/filepath"
)


func HandleCreateTemplate(w http.ResponseWriter, r *http.Request) {
	var req TemplateRequest
	if err := parseJSONRequest(r, &req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	imagePath := filepath.Join(IsoPath, req.ImageName)

	if err := execCommand("qm", "create", req.ID, "--name", req.Name, "--ide2", "--memory", "1024"); err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to create VM: %s", err))
		return
	}

	if err := execCommand("qm", "importdisk", req.ID, imagePath, "local-lvm"); err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to import disk: %s", err))
		return
	}

	if err := execCommand("qm", "set", req.ID, "--scsihw", "virtio-scsi-pci", "--scsi0", "local-lvm:vm-"+req.ID+"-disk-0"); err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to set disk: %s", err))
		return
	}

	if err := execCommand("qm", "set", req.ID, "--boot", "c", "--bootdisk", "scsi0"); err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to set boot disk: %s", err))
		return
	}

	respondWithJSON(w, http.StatusOK, BaseResponse{
		Status:  "success",
		Message: "Template created successfully",
	})
}