package handlers

import (
	"fmt"
	"net/http"
	"strings"
)

// HandleRemoteNFSRegister はリモートNFS（別ノード上）をProxmoxに登録します
// リクエスト: RemoteNFSRegisterRequest (storage_name, server_ip, export_path, node_name, content)
// 処理: pvesm add nfs コマンドで登録
func HandleRemoteNFSRegister(w http.ResponseWriter, r *http.Request) {
	if !validateHTTPMethod(w, r, http.MethodPost) {
		return
	}

	var req RemoteNFSRegisterRequest
	if err := parseJSONRequest(r, &req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// バリデーション
	if req.StorageName == "" || req.ServerIP == "" || req.ExportPath == "" || req.NodeName == nil || len(req.NodeName) == 0 {
		respondWithError(w, http.StatusBadRequest, "storage_name, server_ip, export_path, and node_name are required")
		return
	}

	// デフォルト content 設定
	if len(req.Content) == 0 {
		req.Content = []string{"images", "rootdir"}
	}

	// pvesm add nfs コマンド実行
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

	respondWithSuccess(w, fmt.Sprintf("Remote NFS '%s' registered on nodes '%s'", req.StorageName, strings.Join(req.NodeName, ",")), map[string]string{
		"storage_name": req.StorageName,
		"server_ip":    req.ServerIP,
		"export_path":  req.ExportPath,
	})
}

