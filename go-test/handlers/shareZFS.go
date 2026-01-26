package handlers

import (
	"fmt"
	"net/http"
)

// ZFS NFS公開設定
func HandleZFSShareNFS(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
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

	// sharenfs のプロパティ値を構築
	// rw=@192.168.3.0/24,no_root_squash
	var shareNFSValue string
	if req.ReadWrite {
		shareNFSValue = fmt.Sprintf("rw=@%s", req.Network)
	} else {
		shareNFSValue = fmt.Sprintf("rw=@%s,ro=*", req.Network)
	}

	if !req.RootSquash { // RootSquash=falseは no_root_squash を意味する
		shareNFSValue += ",no_root_squash"
	}

	// zfs set sharenfs="..." <pool_name>
	if err := execCommand("zfs", "set", fmt.Sprintf("sharenfs=%s", shareNFSValue), req.PoolName); err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to set NFS share: %v", err))
		return
	}

	respondWithJSON(w, http.StatusOK, BaseResponse{
		Status:  "success",
		Message: fmt.Sprintf("ZFS pool '%s' shared over NFS to network '%s'", req.PoolName, req.Network),
	})
}
