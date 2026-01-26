package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
)

// リモートNFS登録 (別ノード用)
func HandleRemoteNFSRegister(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req RemoteNFSRegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithJSON(w, http.StatusBadRequest, BaseResponse{
			Status:  "error",
			Message: "Invalid request body",
		})
		return
	}

	// バリデーション
	if req.StorageName == "" || req.ServerIP == "" || req.ExportPath == "" || req.NodeName == nil || len(req.NodeName) == 0 {
		respondWithJSON(w, http.StatusBadRequest, BaseResponse{
			Status:  "error",
			Message: "storage_name, server_ip, export_path, and node_name are required",
		})
		return
	}

	// デフォルト content が指定されていなければ設定
	if len(req.Content) == 0 {
		req.Content = []string{"images", "rootdir"}
	}

	// pvesm add nfs <storage_name> --server <server_ip> --export <export_path> --content <content> --nodes <node_name>
	args := []string{
		"add", "nfs", req.StorageName,
		"--server", req.ServerIP,
		"--export", req.ExportPath,
		"--content", strings.Join(req.Content, ","),
		"--nodes", strings.Join(req.NodeName, ","),
	}

	if err := execCommand("pvesm", args...); err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to register remote NFS: %v", err))
		return
	}

	respondWithJSON(w, http.StatusOK, BaseResponse{
		Status:  "success",
		Message: fmt.Sprintf("Remote NFS '%s' registered on nodes '%s'", req.StorageName, strings.Join(req.NodeName, ",")),
		Data: ZFSCreateResponse{
			Status:      "success",
			StorageName: req.StorageName,
		},
	})
}

