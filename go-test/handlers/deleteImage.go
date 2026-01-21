package handlers

import (
	"fmt"
	"net/http"
	"path/filepath"
)

func HandleDeleteImage(w http.ResponseWriter, r *http.Request) {
	var req ImageDeleteRequest
	if err := parseJSONRequest(r, &req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	imagePath := filepath.Join(IsoPath, req.ImageName)
	if err := execCommand("rm", "-f", imagePath); err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to delete image: %s", err))
		return
	}

	respondWithJSON(w, http.StatusOK, BaseResponse{
		Status:  "success",
		Message: "Image deleted successfully",
	})
}