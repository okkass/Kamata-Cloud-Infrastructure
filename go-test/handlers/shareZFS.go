package handlers

import (
	"fmt"
	"net/http"
)

// HandleZFSShareNFS はZFSプールをNFSで公開します
// リクエスト: ZFSShareNFSRequest (pool_name, network, read_write, root_squash)
// 処理: zfs set sharenfs コマンドで公開設定
func HandleZFSShareNFS(w http.ResponseWriter, r *http.Request) {
	if !validateHTTPMethod(w, r, http.MethodPost) {
		return
	}

	var req ZFSShareNFSRequest
	if err := parseJSONRequest(r, &req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// バリデーション
	if req.PoolName == "" || req.Network == "" {
		respondWithError(w, http.StatusBadRequest, "pool_name and network are required")
		return
	}

	// NFS公開設定の構築 (例: rw=@192.168.3.0/24,no_root_squash)
	shareNFSValue := fmt.Sprintf("rw=@%s", req.Network)
	if !req.RootSquash {
		shareNFSValue += ",no_root_squash"
	}

	// zfs set sharenfs="..." pool_name
	if err := execCommand("zfs", "set", fmt.Sprintf("sharenfs=%s", shareNFSValue), req.PoolName); err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to set NFS share: %v", err))
		return
	}

	respondWithSuccess(w, fmt.Sprintf("ZFS pool '%s' shared over NFS to network '%s'", req.PoolName, req.Network), nil)
}
