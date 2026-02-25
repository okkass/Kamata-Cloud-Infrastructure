package main

import (
	"fmt"
	"log"
	"net/http"

	"kci-agent/handlers"
)

func main() {
	// ログ設定: 日時とマイクロ秒を表示
	log.SetFlags(log.Ldate | log.Ltime | log.Lmicroseconds)

	registerHandlers()

	// 利用可能なエンドポイント一覧を表示
	fmt.Printf("Available EndPoint...\n")
	fmt.Printf("[POST] %s\n", EndpointCreateTemplate)
	fmt.Printf("[POST] %s\n", EndpointDeleteImage)
	fmt.Printf("[GET]  %s\n", EndpointNodeInfo)
	fmt.Printf("[POST] %s\n", EndpointNodeAdd)
	fmt.Printf("[POST] %s\n", EndpointZFSCreate)
	fmt.Printf("[POST] %s\n", EndpointZFSShare)
	fmt.Printf("[POST] %s\n", EndpointZFSStopShare)
	fmt.Printf("[POST] %s\n", EndpointNFSRegister)
	fmt.Printf("[POST] %s\n", EndpointCreateVM)
	fmt.Printf("[POST] %s\n", EndpointAttachSecurityGroup)
	fmt.Printf("[POST] %s\n", EndpointDetachSecurityGroup)
	fmt.Printf("[POST] %s\n", EndpointBackupCreate)
	fmt.Printf("[POST] %s\n", EndpointBackupRestore)

	log.Printf("Listening for requests on %s...", handlers.Port)
	log.Fatal(http.ListenAndServe(handlers.Port, nil))
}

