package handlers

import (
	"net/http"
	"os/exec"
	"strings"
)

// HandleNodeInfo はノードの情報（IPアドレス、ホスト名）を返します
// リクエスト: GETメソッドのみ対応
// 処理: hostname コマンドで取得
func HandleNodeInfo(w http.ResponseWriter, r *http.Request) {
	if !validateHTTPMethod(w, r, http.MethodGet) {
		return
	}

	var resp NodeInfoResponse

	// IPアドレス取得
	hostnameCmd := exec.Command("sh", "-c", "hostname -I | awk '{print $1}'")
	hostnameOut, err := hostnameCmd.CombinedOutput()
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to get IP address")
		return
	}
	resp.IPAddress = strings.TrimSpace(string(hostnameOut))

	// ホスト名取得
	hostnameCmd = exec.Command("hostname")
	hostnameOut, err = hostnameCmd.Output()
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to get hostname")
		return
	}
	resp.Hostname = strings.TrimSpace(string(hostnameOut))

	respondWithJSON(w, http.StatusOK, resp)
}
