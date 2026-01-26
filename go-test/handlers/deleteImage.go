package handlers

import (
	"fmt"
	"net/http"
)

func HandleDeleteImage(w http.ResponseWriter, r *http.Request) {
var req ImageDeleteRequest
	if err := parseJSONRequest(r, &req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if req.StorageID == "" || req.ImageName == "" {
		respondWithError(w, http.StatusBadRequest, "storage_id and image_name are required")
		return
	}

	// 1. Volume ID を構築する
	// ISOイメージの場合、プレフィックスは通常 "iso/" になります
	// 形式: storage_id:iso/image_name
	volumeID := fmt.Sprintf("%s:iso/%s", req.StorageID, req.ImageName)

	// 2. pvesm free コマンドを実行
	// これだけで、対象がローカルディレクトリだろうがNFSだろうがZFSだろうが適切に削除されます
	if err := execCommand("pvesm", "free", volumeID); err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to delete image: %s", err))
		return
	}

	respondWithJSON(w, http.StatusOK, BaseResponse{
		Status:  "success",
		Message: fmt.Sprintf("Image '%s' deleted successfully from '%s'", req.ImageName, req.StorageID),
	})
}