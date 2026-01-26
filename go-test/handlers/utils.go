package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os/exec"
	"strings"
)

// === HTTPメソッド検証 ===

// validateHTTPMethod はリクエストのHTTPメソッドを検証します
func validateHTTPMethod(w http.ResponseWriter, r *http.Request, allowedMethods ...string) bool {
	for _, method := range allowedMethods {
		if r.Method == method {
			return true
		}
	}
	respondWithError(w, http.StatusMethodNotAllowed, fmt.Sprintf("Method %s not allowed", r.Method))
	return false
}

// === JSON処理 ===

// parseJSONRequest はリクエストボディをJSONとしてデコードします
func parseJSONRequest(r *http.Request, v any) error {
	if r.Body == nil {
		return fmt.Errorf("request body is empty")
	}
	decoder := json.NewDecoder(r.Body)
	defer r.Body.Close()
	return decoder.Decode(v)
}

// respondWithJSON は指定されたペイロードをJSONレスポンスとして返します
func respondWithJSON(w http.ResponseWriter, statusCode int, payload any) {
	response, err := json.Marshal(payload)
	if err != nil {
		log.Printf("[ERROR] JSON Marshal failed: %v", err)
		respondWithError(w, http.StatusInternalServerError, "JSON encoding error")
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	w.Write(response)
}

// respondWithError はエラーレスポンスを返します
func respondWithError(w http.ResponseWriter, statusCode int, message string) {
	respondWithJSON(w, statusCode, BaseResponse{
		Status:  "error",
		Message: message,
	})
}

// respondWithSuccess はサクセスレスポンスを返します
func respondWithSuccess(w http.ResponseWriter, message string, data any) {
	respondWithJSON(w, http.StatusOK, BaseResponse{
		Status:  "success",
		Message: message,
		Data:    data,
	})
}

// === コマンド実行 ===

// CommandResult はコマンド実行の結果を表します
type CommandResult struct {
	Success bool
	Output  string
	Error   string
}

// execCommand はシステムコマンドを実行し、結果を返します
func execCommand(name string, args ...string) error {
	cmd := exec.Command(name, args...)
	cmdStr := fmt.Sprintf("%s %s", name, strings.Join(args, " "))
	log.Printf("[EXEC] %s", cmdStr)

	out, err := cmd.CombinedOutput()
	if err != nil {
		errMsg := fmt.Sprintf("%v: %s", err, string(out))
		log.Printf("[ERROR] %s", errMsg)
		return fmt.Errorf("%s", errMsg)
	}
	log.Printf("[OK] Command executed successfully")
	return nil
}

// execCommandWithOutput はコマンドを実行し、出力を返します
func execCommandWithOutput(name string, args ...string) (CommandResult, error) {
	cmd := exec.Command(name, args...)
	cmdStr := fmt.Sprintf("%s %s", name, strings.Join(args, " "))
	log.Printf("[EXEC] %s", cmdStr)

	out, err := cmd.CombinedOutput()
	output := string(out)

	if err != nil {
		errMsg := fmt.Sprintf("%v", err)
		log.Printf("[ERROR] %s: %s", errMsg, output)
		return CommandResult{
			Success: false,
			Output:  output,
			Error:   errMsg,
		}, err
	}

	log.Printf("[OK] Command executed successfully")
	return CommandResult{
		Success: true,
		Output:  output,
	}, nil
}