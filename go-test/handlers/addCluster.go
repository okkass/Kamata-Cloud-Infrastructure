package handlers

import (
	"fmt"
	"net/http"
	"os"
)

// HandleNodeAdd はクラスターに新しいノードを追加します
// リクエスト: NodeAddRequest (node_name, ip_address, master_ip, local_password, master_password)
// 処理: expect スクリプトで SSH 経由でクラスター参加コマンドを実行
func HandleNodeAdd(w http.ResponseWriter, r *http.Request) {
	if !validateHTTPMethod(w, r, http.MethodPost) {
		return
	}

	var req NodeAddRequest
	if err := parseJSONRequest(r, &req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	// バリデーション
	if req.NodeName == "" || req.IPAddress == "" || req.MasterIPAddress == "" {
		respondWithError(w, http.StatusBadRequest, "node_name, ip_address, and master_ip are required")
		return
	}

	// expect スクリプトを構築
	expectScript := fmt.Sprintf(`
set timeout 60
spawn ssh -o StrictHostKeyChecking=no root@%s
expect "password:" { send "%s\r" }
expect "#"
send "pvecm add %s --use_ssh\r"
expect {
    "Are you sure you want to continue connecting" {
        send "yes\r"
        exp_continue
    }
    "password" {
        send "%s\r"
    }
}
expect "#"
send "exit\r"
`, req.IPAddress, req.LocalPassword, req.MasterIPAddress, req.MasterPassword)

	// 一時ファイルに書き込み
	tmpFile := "/tmp/expect_script.exp"
	if err := os.WriteFile(tmpFile, []byte(expectScript), 0600); err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to create expect script: %v", err))
		return
	}
	defer os.Remove(tmpFile)

	// expect スクリプト実行
	if err := execCommand("expect", tmpFile); err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to add node: %v", err))
		return
	}

	respondWithSuccess(w, "Node added successfully", map[string]string{
		"node_name":  req.NodeName,
		"ip_address": req.IPAddress,
	})
}