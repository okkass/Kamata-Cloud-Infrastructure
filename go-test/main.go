package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os/exec"
)


func handler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		fmt.Fprintln(w, "POST で JSON の文字列配列を送信してください。例: [\"a\",\"b\"]")
		return
	}

	defer r.Body.Close()

	var arr []string
	if err := json.NewDecoder(r.Body).Decode(&arr); err != nil {
		http.Error(w, "invalid JSON array of strings", http.StatusBadRequest)
		return
	}

	out, err := exec.Command(arr[0], arr[1:]...).Output()
	if err != nil {
		http.Error(w, fmt.Sprintf("command execution failed: %v", err), http.StatusInternalServerError)
		return
	}

	fmt.Printf("Command output: %s\n", out)

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"output": string(out),
	})
}

func main() {
	http.HandleFunc("/", handler)
	http.ListenAndServe(":8080", nil)
}