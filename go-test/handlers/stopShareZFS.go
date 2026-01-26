package handlers

import (
	"fmt"
	"net/http"
)

// HandleStopNFSShare はZFSプールのNFS公開を停止し、Proxmoxのストレージ登録を削除します
// リクエスト: StopNFSShareRequest (storage_id, pool_name)
// 処理: Proxmox登録削除 → ZFS共有設定OFF
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

	// ステップ1: Proxmoxからストレージ登録を削除
	// 存在チェック後に削除（冪等性担保）
	if err := execCommand("pvesm", "list", req.StorageID); err == nil {
		if err := execCommand("pvesm", "remove", req.StorageID); err != nil {
			respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to remove storage: %v", err))
			return
		}
	}

	// ステップ2: ZFS共有設定をOFF
	if err := execCommand("zfs", "set", "sharenfs=off", req.PoolName); err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to disable NFS share: %v", err))
		return
	}

	respondWithSuccess(w, fmt.Sprintf("NFS share stopped for pool '%s'", req.PoolName), nil)
}