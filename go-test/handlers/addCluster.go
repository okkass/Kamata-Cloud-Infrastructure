package handlers

import (
	"fmt"
	"log"
	"net/http"
)

func HandleNodeAdd(w http.ResponseWriter, r *http.Request) {
	var req NodeAddRequest
	if err := parseJSONRequest(r, &req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	// expectを使って対話形式を自動化
	expectScript := fmt.Sprintf(`
set timeout 60
spawn ssh -o StrictHostKeyChecking=no root@%s

# 1. 新ノードへのSSHログイン
expect {
    "password:" { send "%s\r" }
}
expect "#"

# 2. クラスターへの参加コマンド
# --use_ssh をつけると内部的にSSHを使うので挙動が安定しやすい
send "pvecm add %s --use_ssh\r"

# 3. クラスター側の認証 (Fingerprint -> Password)
expect {
    # 指紋の確認が出た場合
    "Are you sure you want to continue connecting" {
        send "yes\r"
        exp_continue
    }
    # クラスター(Master)のパスワード入力
    "password" {
        send "%s\r"
    }
}

# 4. 完了待ち (同期に時間がかかる場合がある)
expect "#"
send "exit\r"
`, req.IPAddress, req.LocalPassword, req.MasterIPAddress, req.MasterPassword)

	tmpFile := "/tmp/expect_script.exp"
	if err := execCommand("bash", "-c", fmt.Sprintf("echo '%s' > %s", expectScript, tmpFile)); err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to create expect script: %s", err))
		return
	}

	if err := execCommand("expect", tmpFile); err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to add node: %s", err))
		return
	}

	if err := execCommand("rm", "-f", tmpFile); err != nil {
		log.Printf("[WARN] Failed to remove temporary expect script: %s", err)
	}

	respondWithJSON(w, http.StatusOK, BaseResponse{
		Status:  "success",
		Message: "Node added successfully",
	})
}