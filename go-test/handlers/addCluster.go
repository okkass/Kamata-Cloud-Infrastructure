package handlers

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"strings"
)

// HandleNodeAdd はクラスターに新しいノードを追加します
// リクエスト: NodeAddRequest (node_name, ip_address, master_ip)
// 環境変数: LOCAL_PASSWORD, MASTER_PASSWORD で認証情報を指定してください
// 処理: SSH 経由でクラスター参加コマンドを実行
//
// セキュリティに関する注意：
// パスワードは環境変数で指定することを強く推奨します。
// request body にパスワードを含めないでください（ログに記録される可能性があります）
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

	// 環境変数から認証情報を取得
	localPass := os.Getenv("LOCAL_PASSWORD")
	masterPass := os.Getenv("MASTER_PASSWORD")
	if localPass == "" || masterPass == "" {
		respondWithError(w, http.StatusBadRequest, "LOCAL_PASSWORD and MASTER_PASSWORD environment variables are required")
		return
	}

	// expect コマンドで SSH経由のクラスター参加を実行
	// expect は標準入力でスクリプトを受け取る方式を使用
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
`, req.IPAddress, localPass, req.MasterIPAddress, masterPass)

	// expect をパイプで実行（スクリプトを標準入力で渡す方式）
	cmd := exec.Command("expect")
	// TODO: strings.NewReader で expectScript を渡すように改善可能
	cmd.Stdin = strings.NewReader(expectScript)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	log.Printf("[EXEC] expect (pvecm add via SSH to %s)", req.IPAddress)

	if err := cmd.Run(); err != nil {
		log.Printf("[ERROR] Failed to add node: %v", err)
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to add node: %v", err))
		return
	}

	respondWithSuccess(w, "Node added successfully", map[string]string{
		"node_name":  req.NodeName,
		"ip_address": req.IPAddress,
	})
}