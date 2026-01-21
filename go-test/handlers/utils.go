package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os/exec"
	"strings"
)

// === ヘルパー関数: コマンド実行とログ ===
func execCommand(name string, args ...string) error {
	cmd := exec.Command(name, args...)
	cmdStr := fmt.Sprintf("%s %s", name, strings.Join(args, " "))
	log.Printf("[EXEC] %s", cmdStr)

	out, err := cmd.CombinedOutput()
	if err != nil {
		log.Printf("[ERROR] Command failed: %s\nOutput: %s", err, string(out))
		return fmt.Errorf("%s: %s", err, string(out))
	}
	return nil
}

func parseJSONRequest(r *http.Request, v any) error {
	decoder := json.NewDecoder(r.Body)
	defer r.Body.Close()
	return decoder.Decode(v)
}

func respondWithJSON(w http.ResponseWriter, statusCode int, payload any) {
	response, err := json.Marshal(payload)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "JSON Marshalling Error")
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	w.Write(response)
}

func respondWithError(w http.ResponseWriter, statusCode int, message string) {
	respondWithJSON(w, statusCode, BaseResponse{
		Status:  "error",
		Message: message,
	})
}