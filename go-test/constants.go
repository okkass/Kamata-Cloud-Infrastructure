package main

const (
	EndpointCreateTemplate       = "/api/template/create"
	EndpointDeleteImage         = "/api/image/delete"
	EndpointNodeInfo            = "/api/node/info"
	EndpointNodeAdd             = "/api/node/add"
	EndpointLVMCreate           = "/api/storage/lvm/create"
	EndpointZFSPoolCreate        = "/api/storage/zfs/create"
	EndpointZFSShare       = "/api/storage/zfs/share"
	EndpointZFSStopShare    = "/api/storage/zfs/stop-share"
	EndpointCreateVM            = "/api/vm/create"
	EndpointAttachSecurityGroup = "/api/security-group/attach"
	EndpointDetachSecurityGroup = "/api/security-group/detach"
	EndpointBackupCreate        = "/api/backup/create"
	EndpointBackupRestore       = "/api/backup/restore"
)