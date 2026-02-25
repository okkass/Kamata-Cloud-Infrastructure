package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os/exec"
	"strconv"
)

type FirewallRule struct {
	Pos     int    `json:"pos"`
	Comment string `json:"comment,omitempty"`
}

// HandleSecurityGroupDetach はセキュリティグループをVMのネットワークインターフェースから削除します
// リクエスト: SecurityGroupDetachRequest (vmid, node_name, security_group_uuid)
// 処理: pvesh get でルール一覧を取得 → UUIDマッチするルールを削除
func HandleSecurityGroupDetach(w http.ResponseWriter, r *http.Request) {
	if !validateHTTPMethod(w, r, http.MethodPost) {
		return
	}

	var req SecurityGroupDetachRequest
	if err := parseJSONRequest(r, &req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if req.VMID == "" || req.NodeName == "" || req.SecurityGroupUUID == "" {
		respondWithError(w, http.StatusBadRequest, "vmid, node_name, and security_group_uuid are required")
		return
	}

	// Step 1: ルール一覧を取得して、UUID(comment)が一致するルールの pos (番号) を探す
	listCmd := fmt.Sprintf("/nodes/%s/qemu/%s/firewall/rules", req.NodeName, req.VMID)
	
	cmd := exec.Command("pvesh", "get", listCmd, "--output-format", "json")
	output, err := cmd.CombinedOutput()
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to fetch firewall rules: %v", err))
		return
	}

	var rules []FirewallRule
	if err := json.Unmarshal(output, &rules); err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to parse firewall rules")
		return
	}

	targetPos := -1
	for _, rule := range rules {
		if rule.Comment == req.SecurityGroupUUID {
			targetPos = rule.Pos
			break
		}
	}

	if targetPos == -1 {
		respondWithError(w, http.StatusNotFound, "Security group rule not found (UUID mismatch)")
		return
	}

	// Step 2: 見つけた pos を使って削除
	deleteCmd := fmt.Sprintf("/nodes/%s/qemu/%s/firewall/rules/%s", req.NodeName, req.VMID, strconv.Itoa(targetPos))
	if err := execCommand("pvesh", "delete", deleteCmd); err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to delete firewall rule pos %d: %v", targetPos, err))
		return
	}

	respondWithSuccess(w, "Security group detached successfully", nil)
}