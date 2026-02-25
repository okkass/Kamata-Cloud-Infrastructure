package main

import (
	"kci-agent/handlers"
	"net/http"
)

func registerHandlers() {
	// イメージ・テンプレート管理
	http.HandleFunc(EndpointCreateTemplate, handlers.HandleCreateTemplate)
	http.HandleFunc(EndpointDeleteImage, handlers.HandleDeleteImage)

	// ノード管理
	http.HandleFunc(EndpointNodeInfo, handlers.HandleNodeInfo)
	http.HandleFunc(EndpointNodeAdd, handlers.HandleNodeAdd)

	// ストレージ管理
	http.HandleFunc(EndpointZFSCreate, handlers.HandleCreateAndRegisterZFS)
	http.HandleFunc(EndpointZFSShare, handlers.HandleZFSShareNFS)
	http.HandleFunc(EndpointZFSStopShare, handlers.HandleStopNFSShare)
	http.HandleFunc(EndpointNFSRegister, handlers.HandleRemoteNFSRegister)

	// 仮想マシン管理
	http.HandleFunc(EndpointCreateVM, handlers.HandleCreateVM)

	// セキュリティグループ
	http.HandleFunc(EndpointAttachSecurityGroup, handlers.HandleSecurityGroupAttach)
	http.HandleFunc(EndpointDetachSecurityGroup, handlers.HandleSecurityGroupDetach)

	// バックアップ
	http.HandleFunc(EndpointBackupCreate, handlers.HandleBackupCreate)
	http.HandleFunc(EndpointBackupRestore, handlers.HandleBackupRestore)
}

