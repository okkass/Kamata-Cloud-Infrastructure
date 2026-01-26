package handlers

import (
	"fmt"
	"net/http"
	"strings"
)

// ---------------------------------------------------------
// ロジック関数
// ---------------------------------------------------------

// ZFSプール作成ロジック
func createZFSPoolLogic(poolName, device string) error {
	// 念の為、既存のパーティション情報を消す (Wipe)
	// エラーが出ても無視して進む (新品ディスクだとエラーになることがあるため)
	execCommand("wipefs", "-a", device)

	// zpool create -f <poolname> <device>
	return execCommand("zpool", "create", "-f", poolName, device)
}

// Proxmox登録ロジック
func registerZFSPoolLogic(storageName, poolName, nodeName string, content []string) error {
	// コンテンツのデフォルト設定
	if len(content) == 0 {
		content = []string{"images", "rootdir"}
	}

	// pvesm add zfspool ...
	return execCommand("pvesm", "add", "zfspool", storageName,
		"--pool", poolName,
		"--content", strings.Join(content, ","),
		"--nodes", nodeName)
}

// ---------------------------------------------------------
// ハンドラー
// ---------------------------------------------------------

// HandleCreateAndRegisterZFS : 作成から登録まで一括で行う
func HandleCreateAndRegisterZFS(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req CreateAndRegisterZFSRequest
	if err := parseJSONRequest(r, &req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// バリデーション
	if req.PoolName == "" || req.Device == "" || req.NodeName == "" {
		respondWithError(w, http.StatusBadRequest, "pool_name, device, and node_name are required")
		return
	}

	// storage_name が空なら pool_name と同じにする便利機能
	if req.StorageName == "" {
		req.StorageName = req.PoolName
	}

	// --- Step 1: ZFSプール作成 ---
	if err := createZFSPoolLogic(req.PoolName, req.Device); err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to create ZFS pool: %v", err))
		return
	}

	// --- Step 2: Proxmoxへの登録 ---
	if err := registerZFSPoolLogic(req.StorageName, req.PoolName, req.NodeName, req.Content); err != nil {
		// ロールバック処理
		fmt.Printf("Registration failed, rolling back ZFS pool '%s'...\n", req.PoolName)
		execCommand("zpool", "destroy", "-f", req.PoolName)
		execCommand("wipefs", "-a", req.Device)

		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to register storage (Rolled back): %v", err))
		return
	}

	// --- 完了レスポンス ---
	respondWithJSON(w, http.StatusOK, BaseResponse{
		Status:  "success",
		Message: fmt.Sprintf("ZFS pool '%s' created and registered as '%s' on node '%s'", req.PoolName, req.StorageName, req.NodeName),
		Data: map[string]string{
			"pool_name":    req.PoolName,
			"storage_name": req.StorageName,
			"device":       req.Device,
			"node":         req.NodeName,
		},
	})
}