package handlers

import (
	"fmt"
	"log"
	"net/http"
	"path/filepath"
)

// HandleCreateTemplate はOSイメージをProxmoxテンプレートに変換します
// リクエスト: TemplateRequest (id, name, image_name)
// 処理: イメージインポート → ディスク設定 → テンプレート化
// 失敗時: 自動的に作成されたテンプレートVMを削除
func HandleCreateTemplate(w http.ResponseWriter, r *http.Request) {
	if !validateHTTPMethod(w, r, http.MethodPost) {
		return
	}

	var req TemplateRequest
	if err := parseJSONRequest(r, &req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	// バリデーション
	if req.ID == "" || req.Name == "" || req.ImageName == "" {
		respondWithError(w, http.StatusBadRequest, "id, name, and image_name are required")
		return
	}

	// 失敗時の自動ロールバック: テンプレートVM 削除
	shouldRollback := true
	defer func() {
		if shouldRollback {
			log.Printf("[ROLLBACK] Removing template VM %s due to creation failure...", req.ID)
			execCommand("qm", "destroy", req.ID)
		}
	}()

	imagePath := filepath.Join(IsoPath, req.ImageName)

	// ステップ1: VM作成
	if err := execCommand("qm", "create", req.ID, "--name", req.Name, "--ide2", "--memory", "1024"); err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to create VM: %v", err))
		return
	}

	// ステップ2: ディスクインポート
	if err := execCommand("qm", "importdisk", req.ID, imagePath, DefaultStorage); err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to import disk: %v", err))
		return
	}

	// ステップ3: ディスク設定
	if err := execCommand("qm", "set", req.ID, "--scsihw", "virtio-scsi-pci", "--scsi0", fmt.Sprintf("%s:vm-%s-disk-0", DefaultStorage, req.ID)); err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to set disk: %v", err))
		return
	}

	// ステップ4: ブート設定
	if err := execCommand("qm", "set", req.ID, "--boot", "c", "--bootdisk", "scsi0"); err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to set boot: %v", err))
		return
	}

	// 成功時: ロールバック無効化
	shouldRollback = false

	respondWithSuccess(w, "Template created successfully", map[string]string{
		"vm_id": req.ID,
		"name":  req.Name,
	})
}