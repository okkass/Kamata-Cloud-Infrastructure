package main

import (
	"kci-agent/handlers"
	"net/http"
)

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

