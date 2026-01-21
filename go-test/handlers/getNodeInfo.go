package handlers

import (
	"net/http"
	"os/exec"
	"strings"
)

func HandleNodeInfo(w http.ResponseWriter, r *http.Request) {
	var resp NodeInfoResponse
	hostnameCmd := exec.Command("sh", "-c", "hostname -I | awk '{print $1}'")
	hostnameOut, err := hostnameCmd.CombinedOutput()
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to get IP address")
		return
	}
	resp.IPAddress = strings.TrimSpace(string(hostnameOut))

	hostnameCmd = exec.Command("hostname")
	hostnameOut, err = hostnameCmd.Output()
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to get hostname")
		return
	}
	resp.Hostname = strings.TrimSpace(string(hostnameOut))

	respondWithJSON(w, http.StatusOK, resp)
}
