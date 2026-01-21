package handlers

import (
	"fmt"
	"net/http"
)

func HandleSecurityGroupAttach(w http.ResponseWriter, r *http.Request) {
	var req SecurityGroupAttachRequest
	if err := parseJSONRequest(r, &req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if err := execCommand("pvesh", "create", fmt.Sprintf("/nodes/%s/qemu/%s/firewall/rules", req.NodeName, req.VMID),
		"--type", "group",
		"--action", req.SecurityGroupName,
		"--comment", req.SecurityGroupUUID,
		"--enable", "1",
	); err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to attach security group: %s", err))
		return
	}
	respondWithJSON(w, http.StatusOK, BaseResponse{
		Status:  "success",
		Message: "Security group attached successfully",
	})
}