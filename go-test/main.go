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

	fmt.Printf("Available EndPoint...\n")
	fmt.Printf("[POST] %s\n", EndpointCreateTemplate)
	fmt.Printf("[POST] %s\n", EndpointDeleteImage)
	fmt.Printf("[GET]  %s\n", EndpointNodeInfo)
	fmt.Printf("[POST] %s\n", EndpointNodeAdd)
	fmt.Printf("[POST] %s\n", EndpointLVMCreate)
	fmt.Printf("[POST] %s\n", EndpointNFSCreate)
	fmt.Printf("[POST] %s\n", EndpointNFSUpdate)
	fmt.Printf("[POST] %s\n", EndpointCreateVM)
	fmt.Printf("[POST] %s\n", EndpointAttachSecurityGroup)
	fmt.Printf("[POST] %s\n", EndpointDetachSecurityGroup)
	fmt.Printf("[POST] %s\n", EndpointBackupCreate)
	fmt.Printf("[POST] %s\n", EndpointBackupRestore)

	log.Printf("Listening for requests...")
	log.Fatal(http.ListenAndServe(handlers.Port, nil))
}

