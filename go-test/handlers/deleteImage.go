package handlers

import (
	"fmt"
	"net/http"
)

// HandleDeleteImage はProxmoxストレージ上のイメージを削除します
// リクエスト: ImageDeleteRequest (storage_id, image_name)
// 処理: pvesm free コマンドで削除
func HandleDeleteImage(w http.ResponseWriter, r *http.Request) {
	if !validateHTTPMethod(w, r, http.MethodPost) {
		return
	}

	var req ImageDeleteRequest
	if err := parseJSONRequest(r, &req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	// バリデーション
	if req.StorageID == "" || req.ImageName == "" {
		respondWithError(w, http.StatusBadRequest, "storage_id and image_name are required")
		return
	}

	// VolumeIDを構築 (形式: storage_id:iso/image_name)
	volumeID := fmt.Sprintf("%s:iso/%s", req.StorageID, req.ImageName)

	// pvesm free コマンドでイメージを削除
	if err := execCommand("pvesm", "free", volumeID); err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to delete image: %v", err))
		return
	}

	respondWithSuccess(w, fmt.Sprintf("Image '%s' deleted successfully", req.ImageName), nil)
}