package handlers

// 共通レスポンス
type BaseResponse struct {
	Status  string `json:"status"`
	Message string `json:"message,omitempty"`
	Data    any    `json:"data,omitempty"`
}

// 1. テンプレート作成
type TemplateRequest struct {
	ID        string `json:"id"`         // 例: "9000"
	Name      string `json:"name"`       // 例: "template-base"
	ImageName string `json:"image_name"` // 例: "upload.img"
}

// 2. イメージ削除
type ImageDeleteRequest struct {
	ImageName string `json:"image_name"`
}

// 3. ノード情報
type NodeInfoResponse struct {
	IPAddress string `json:"ip_address"`
	Hostname  string `json:"hostname"`
}

// ノード追加
type NodeAddRequest struct {
	NodeName        string `json:"node_name"`
	IPAddress       string `json:"ip_address"`
	MasterIPAddress string `json:"master_ip"`
	LocalPassword   string `json:"local_password"`
	MasterPassword  string `json:"master_password"`
}

// マスターノード移行
type MasterMigrationRequest struct {
	NewMasterIP       string `json:"new_master_ip"`
	CurrentMasterIP   string `json:"current_master_ip"`
	CurrentMasterPass string `json:"current_master_pass"`
}

// 4. ストレージ作成 (LVM)
type LVMCreateRequest struct {
	Device string `json:"device"`  // 例: "/dev/sdb"
	VGName string `json:"vg_name"` // 例: "new-vg"
	ID     string `json:"id"`      // Proxmox上のID (例: "secondary-lvm")
}

// 5. ストレージ作成 (NFSサーバー構築 & 登録)
type NFSCreateRequest struct {
	VGName     string `json:"vg_name"`     // 親VG (例: "pve")
	VolName    string `json:"vol_name"`    // LV名 (例: "nfs-vol-01")
	Size       string `json:"size"`        // 例: "500G"
	MountPoint string `json:"mount_point"` // 例: "/mnt/nfs/nfs-vol-01"
	Network    string `json:"network"`     // 例: "192.168.3.0/24"
	ID         string `json:"id"`          // Proxmox上のID (例: "shared-nfs-01")
	ServerIP   string `json:"server_ip"`   // 自分のIP (例: "192.168.3.40")
}

// 6. VM作成
type NetworkConfig struct {
	Bridge     string `json:"bridge"`      // 例: "vmbr0"
	Model      string `json:"model"`       // 例: "virtio" (基本これ), "e1000"
	MacAddress string `json:"mac_address"` // (重要) DHCP固定運用のためのMAC指定 例: "BC:24:11:XX:XX:XX"

	// Cloud-Init用
	// 空文字なら "dhcp" として扱います
	IPAddress string `json:"ip_address"` // Opt: 固定したい場合のみ "192.168.3.100/24"
	Gateway   string `json:"gateway"`    // Opt: 固定したい場合のみ "192.168.3.1"
}

// 他の構造体は変更なし
type DiskConfig struct {
	Device  string `json:"device"`
	Storage string `json:"storage"`
	Size    string `json:"size"`
}

type VMCreateRequest struct {
	SourceVMID string `json:"source_vmid"`
	NewVMID    string `json:"new_vmid"`
	NewName    string `json:"new_name"`

	Cores  int `json:"cores"`
	Memory int `json:"memory"`

	Disks    []DiskConfig    `json:"disks"`
	Networks []NetworkConfig `json:"networks"`

	SSHKey    string `json:"ssh_key"`
	AutoStart bool   `json:"auto_start"`
}

type SecurityGroupAttachRequest struct {
	VMID              string `json:"vmid"`
	NodeName          string `json:"node_name"`
	SecurityGroupName string `json:"security_group"`
	SecurityGroupUUID string `json:"security_group_uuid"`
}

type SecurityGroupDetachRequest struct {
	VMID              string `json:"vmid"`
	NodeName          string `json:"node_name"`
	SecurityGroupUUID string `json:"security_group_uuid"`
}

// 7. バックアップ (DD)
type BackupRequest struct {
	VMID       string `json:"vmid"`
	SourceDev  string `json:"source_dev"`  // 例: "/dev/pve/vm-105-disk-0"
	BackupName string `json:"backup_name"` // 例: "vm-105.img"
}

// 8. リストア (DD)
type RestoreRequest struct {
	VMID       string `json:"vmid"`
	TargetDev  string `json:"target_dev"`  // 例: "/dev/pve/vm-105-disk-0"
	BackupName string `json:"backup_name"` // 例: "vm-105.img"
}
