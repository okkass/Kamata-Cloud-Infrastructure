package handlers

import (
	"fmt"
	"net/http"
)

// HandleStopNFSShare はZFSプールを削除します。
// リクエスト: StopNFSShareRequest (storage_id, pool_name)
// 処理: pvesm remove コマンドでストレージ登録削除
func HandleStopNFSShare(w http.ResponseWriter, r *http.Request) {
	if !validateHTTPMethod(w, r, http.MethodPost) {
		return
	}

	var req StopNFSShareRequest
	if err := parseJSONRequest(r, &req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// バリデーション
	if req.StorageID == "" || req.PoolName == "" {
		respondWithError(w, http.StatusBadRequest, "storage_id and pool_name are required")
		return
	}

	// Proxmoxストレージ登録削除
	if err := execCommand("pvesm", "remove", req.StorageID); err != nil {
		fmt.Printf("[WARN] Failed to remove Proxmox storage '%s': %v\n", req.StorageID, err)
	}

	respondWithSuccess(w, fmt.Sprintf("NFS share stopped for pool '%s'", req.PoolName), nil)
}