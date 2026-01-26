package handlers

import (
	"fmt"
	"net/http"
)

// HandleSecurityGroupDetach はセキュリティグループをVMのネットワークインターフェースから削除します
// リクエスト: SecurityGroupDetachRequest (vmid, node_name, security_group_uuid)
// 処理: pvesh delete でファイアウォールルールを削除
func HandleSecurityGroupDetach(w http.ResponseWriter, r *http.Request) {
	if !validateHTTPMethod(w, r, http.MethodPost) {
		return
	}

	var req SecurityGroupDetachRequest
	if err := parseJSONRequest(r, &req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	// バリデーション
	if req.VMID == "" || req.NodeName == "" || req.SecurityGroupUUID == "" {
		respondWithError(w, http.StatusBadRequest, "vmid, node_name, and security_group_uuid are required")
		return
	}

	// ファイアウォールルール削除
	if err := execCommand("pvesh", "delete", fmt.Sprintf("/nodes/%s/qemu/%s/firewall/rules/%s", req.NodeName, req.VMID, req.SecurityGroupUUID)); err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to detach security group: %v", err))
		return
	}

	respondWithSuccess(w, "Security group detached successfully", nil)
}