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

func registerHandlers() {
	// ===== テンプレート & イメージ =====
	http.HandleFunc(EndpointCreateTemplate, handlers.HandleCreateTemplate)
	http.HandleFunc(EndpointDeleteImage, handlers.HandleDeleteImage)

	// ===== ノード =====
	http.HandleFunc(EndpointNodeInfo, handlers.HandleNodeInfo)
	http.HandleFunc(EndpointNodeAdd, handlers.HandleNodeAdd)

	// ===== ストレージ - LVM =====
	http.HandleFunc(EndpointLVMCreate, handlers.HandleLVMCreate)

	// ===== ストレージ - NFS =====
	http.HandleFunc(EndpointNFSCreate, handlers.HandleNFSCreate)
	http.HandleFunc(EndpointNFSUpdate, handlers.HandleNFSUpdate)
	// ===== 仮想マシン =====
	http.HandleFunc(EndpointCreateVM, handlers.HandleCreateVM)

	// ===== ファイアウォール / セキュリティグループ =====
	http.HandleFunc(EndpointAttachSecurityGroup, handlers.HandleSecurityGroupAttach)
	http.HandleFunc(EndpointDetachSecurityGroup, handlers.HandleSecurityGroupDetach)

	// ===== バックアップ =====
	http.HandleFunc(EndpointBackupCreate, handlers.HandleBackupCreate)
	http.HandleFunc(EndpointBackupRestore, handlers.HandleBackupRestore)
}

const (
	EndpointCreateTemplate       = "/api/template/create"
	EndpointDeleteImage         = "/api/image/delete"
	EndpointNodeInfo            = "/api/node/info"
	EndpointNodeAdd             = "/api/node/add"
	EndpointLVMCreate           = "/api/storage/lvm/create"
	EndpointNFSCreate           = "/api/storage/nfs/create"
	EndpointNFSUpdate           = "/api/storage/nfs/update"
	EndpointCreateVM            = "/api/vm/create"
	EndpointAttachSecurityGroup = "/api/security-group/attach"
	EndpointDetachSecurityGroup = "/api/security-group/detach"
	EndpointBackupCreate        = "/api/backup/create"
	EndpointBackupRestore       = "/api/backup/restore"
)