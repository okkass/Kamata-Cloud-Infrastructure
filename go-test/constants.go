package main

const (
	// イメージ・テンプレート管理
	EndpointCreateTemplate = "/api/template/create"
	EndpointDeleteImage    = "/api/image/delete"

	// ノード管理
	EndpointNodeInfo = "/api/node/info"
	EndpointNodeAdd  = "/api/node/add"

	// ストレージ管理
	EndpointZFSCreate    = "/api/storage/zfs/create"
	EndpointZFSShare     = "/api/storage/zfs/share"
	EndpointZFSStopShare = "/api/storage/zfs/stop-share"
	EndpointNFSRegister  = "/api/storage/nfs/register"

	// 仮想マシン管理
	EndpointCreateVM = "/api/vm/create"

	// セキュリティグループ
	EndpointAttachSecurityGroup = "/api/security-group/attach"
	EndpointDetachSecurityGroup = "/api/security-group/detach"

	// バックアップ
	EndpointBackupCreate  = "/api/backup/create"
	EndpointBackupRestore = "/api/backup/restore"
)