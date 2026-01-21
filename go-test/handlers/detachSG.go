package handlers

import (
	"fmt"
	"net/http"
)

func HandleSecurityGroupDetach(w http.ResponseWriter, r *http.Request) {
	var req SecurityGroupDetachRequest
	if err := parseJSONRequest(r, &req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if err := execCommand("pvesh", "delete", fmt.Sprintf("/nodes/%s/qemu/%s/firewall/rules/%s", req.NodeName, req.VMID, req.SecurityGroupUUID)); err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to detach security group: %s", err))
		return
	}
	respondWithJSON(w, http.StatusOK, BaseResponse{
		Status:  "success",
		Message: "Security group detached successfully",
	})
}