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
func createZFSPoolLogic(poolName, device, comment string) error {
	// 念の為、既存のパーティション情報を消す (Wipe)
	// エラーが出ても無視して進む (新品ディスクだとエラーになることがあるため)
	execCommand("wipefs", "-a", device)

	// コマンド引数の構築
	args := []string{"create", "-f"}
	if comment != "" {
		args = append(args, "-o", fmt.Sprintf("comment=%s", comment))
	}
	args = append(args, poolName, device)

	return execCommand("zpool", args...)
}

// Proxmox登録ロジック
// ZFSストレージは--nodesで対象ノードを指定（自分だけ）
// NFSストレージはnodes指定なし（クラスター全体）
func registerZFSPoolLogic(storageName, poolName, nodeName string, content []string) error {
	// コンテンツのデフォルト設定
	if len(content) == 0 {
		content = []string{"images", "rootdir"}
	}

	// ZFSは対象ノードを限定する（--nodesで指定）
	// pvesm add zfspool ...
	return execCommand("pvesm", "add", "zfspool", storageName,
		"--pool", poolName,
		"--content", strings.Join(content, ","),
		"--nodes", nodeName)
}

// ---------------------------------------------------------
// ハンドラー
// ---------------------------------------------------------

// HandleCreateAndRegisterZFS はZFSプール作成とProxmox登録を一括実行します
// リクエスト: CreateAndRegisterZFSRequest (pool_name, device, storage_name, node_name, content)
// 処理: ZFSプール作成 → Proxmox登録、失敗時はロールバック
func HandleCreateAndRegisterZFS(w http.ResponseWriter, r *http.Request) {
	if !validateHTTPMethod(w, r, http.MethodPost) {
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

	// storage_name が空なら pool_name と同じにする
	if req.StorageName == "" {
		req.StorageName = req.PoolName
	}

	// ステップ1: ZFSプール作成（commentを付加）
	if err := createZFSPoolLogic(req.PoolName, req.Device, req.Comment); err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to create ZFS pool: %v", err))
		return
	}

	// ステップ2: Proxmoxへの登録
	if err := registerZFSPoolLogic(req.StorageName, req.PoolName, req.NodeName, req.Content); err != nil {
		// エラー時はロールバック
		execCommand("zpool", "destroy", "-f", req.PoolName)
		execCommand("wipefs", "-a", req.Device)
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to register storage (Rolled back): %v", err))
		return
	}

	// 完了
	respondWithSuccess(w, "ZFS pool created and registered successfully", map[string]string{
		"pool_name":    req.PoolName,
		"storage_name": req.StorageName,
		"device":       req.Device,
		"node":         req.NodeName,
	})
}