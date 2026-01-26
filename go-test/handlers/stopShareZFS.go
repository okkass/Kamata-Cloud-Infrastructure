package handlers

import (
	"fmt"
	"net/http"
)


func HandleStopNFSShare(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
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

	// Step 1: Proxmoxからストレージ設定を削除 (pvesm remove)
	// クラスター共有設定(/etc/pve/storage.cfg)から消えるため、
	// これを実行した瞬間に全ノード(Node Bなど)でアンマウント処理が走ります。
	
	// まず存在確認をして、なければスキップする（冪等性担保）
	if err := execCommand("pvesm", "list", req.StorageID); err == nil {
		// 存在する場合のみ削除実行
		if err := execCommand("pvesm", "remove", req.StorageID); err != nil {
			// 削除に失敗したら致命的エラーとして返す
			respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to remove storage '%s': %v", req.StorageID, err))
			return
		}
	} else {
		// 既に存在しない場合はログだけ出して次へ進む（エラーにはしない）
		fmt.Printf("Storage '%s' not found, skipping removal.\n", req.StorageID)
	}

	// Step 2: ZFSのNFS共有設定をOFFにする
	// zfs set sharenfs=off <pool_name>
	if err := execCommand("zfs", "set", "sharenfs=off", req.PoolName); err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to turn off NFS share for '%s': %v", req.PoolName, err))
		return
	}

	respondWithJSON(w, http.StatusOK, BaseResponse{
		Status:  "success",
		Message: fmt.Sprintf("NFS share stopped for pool '%s' and storage '%s' removed", req.PoolName, req.StorageID),
	})
}