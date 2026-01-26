package handlers

import (
	"fmt"
	"net/http"
)

// HandleSecurityGroupAttach はセキュリティグループをVMのネットワークインターフェースに適用します
// リクエスト: SecurityGroupAttachRequest (vmid, node_name, security_group, security_group_uuid)
// 処理: pvesh create でファイアウォールルールを追加
func HandleSecurityGroupAttach(w http.ResponseWriter, r *http.Request) {
	if !validateHTTPMethod(w, r, http.MethodPost) {
		return
	}

	var req SecurityGroupAttachRequest
	if err := parseJSONRequest(r, &req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	// バリデーション
	if req.VMID == "" || req.NodeName == "" || req.SecurityGroupName == "" {
		respondWithError(w, http.StatusBadRequest, "vmid, node_name, and security_group are required")
		return
	}

	// ファイアウォールルール追加
	if err := execCommand("pvesh", "create", fmt.Sprintf("/nodes/%s/qemu/%s/firewall/rules", req.NodeName, req.VMID),
		"--type", "group",
		"--action", req.SecurityGroupName,
		"--comment", req.SecurityGroupUUID,
		"--enable", "1",
	); err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to attach security group: %v", err))
		return
	}

	respondWithSuccess(w, "Security group attached successfully", nil)
}