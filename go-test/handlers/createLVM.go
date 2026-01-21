package handlers

import (
	"fmt"
	"net/http"
)

func HandleLVMCreate(w http.ResponseWriter, r *http.Request) {
	var req LVMCreateRequest
	if err := parseJSONRequest(r, &req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	// 1. 物理ボリュームの作成
	if err := execCommand("pvcreate", req.Device); err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to create physical volume: %s", err))
		return
	}
}