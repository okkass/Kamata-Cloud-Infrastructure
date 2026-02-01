package handlers

// ============================================================
// レスポンス型
// ============================================================

// BaseResponse は全エンドポイントで使用される基本レスポンス形式です
type BaseResponse struct {
	Status  string `json:"status"`            // "success" or "error"
	Message string `json:"message,omitempty"` // ヒューマンリーダブルなメッセージ
	Data    any    `json:"data,omitempty"`    // レスポンスボディ
}

// NodeInfoResponse はノード情報を返します
type NodeInfoResponse struct {
	IPAddress string `json:"ip_address"`
	Hostname  string `json:"hostname"`
}

// ZFSCreateResponse はZFS作成結果を返します
type ZFSCreateResponse struct {
	Status      string `json:"status"`
	Message     string `json:"message,omitempty"`
	PoolName    string `json:"pool_name,omitempty"`
	StorageName string `json:"storage_name,omitempty"`
}

// ============================================================
// リクエスト型: テンプレート・イメージ管理
// ============================================================

// TemplateRequest はOSテンプレート作成リクエストです
type TemplateRequest struct {
	ID        string `json:"id"`         // VM ID (例: "9000")
	Name      string `json:"name"`       // VM名 (例: "template-base")
	ImageName string `json:"image_name"` // アップロード済みイメージファイル名
}

// ImageDeleteRequest はイメージ削除リクエストです
type ImageDeleteRequest struct {
	StorageID string `json:"storage_id"` // ストレージID (例: "local")
	ImageName string `json:"image_name"` // イメージファイル名
}

// ============================================================
// リクエスト型: ノード管理
// ============================================================

// NodeAddRequest はノード追加リクエストです
type NodeAddRequest struct {
	NodeName        string `json:"node_name"`       // 新ノード名
	IPAddress       string `json:"ip_address"`      // 新ノードのIP
	MasterIPAddress string `json:"master_ip"`       // マスターノードのIP
	LocalPassword   string `json:"local_password"`  // 新ノードのルートパスワード
	MasterPassword  string `json:"master_password"` // マスターノードのパスワード
}

// MasterMigrationRequest はマスターノード移行リクエストです
type MasterMigrationRequest struct {
	NewMasterIP       string `json:"new_master_ip"`
	CurrentMasterIP   string `json:"current_master_ip"`
	CurrentMasterPass string `json:"current_master_pass"`
}

// ============================================================
// リクエスト型: ストレージ管理
// ============================================================

// NFSCreateRequest はLVM/NFSストレージ作成リクエストです
type NFSCreateRequest struct {
	VGName     string `json:"vg_name"`      // ボリュームグループ名 (例: "pve")
	VolName    string `json:"vol_name"`     // ロジカルボリューム名 (例: "nfs-vol-01")
	Size       string `json:"size"`         // ボリュームサイズ (例: "500G")
	MountPoint string `json:"mount_point"` // マウントポイント (例: "/mnt/nfs/nfs-vol-01")
	Network    string `json:"network"`      // NFS公開ネットワーク (例: "192.168.3.0/24")
	ID         string `json:"id"`           // Proxmox登録ID (例: "shared-nfs-01")
	ServerIP   string `json:"server_ip"`    // サーバーIP (例: "192.168.3.40")
}

// CreateAndRegisterZFSRequest はZFSプール作成・登録リクエストです
type CreateAndRegisterZFSRequest struct {
	PoolName    string   `json:"pool_name"`    // ZFSプール名 (例: "poka")
	Device      string   `json:"device"`       // デバイスパス (例: "/dev/sdb")
	StorageName string   `json:"storage_name"` // Proxmoxでの表示名
	NodeName    string   `json:"node_name"`    // 対象ノード名 (例: "test01")
	Content     []string `json:"content"`      // コンテンツタイプ (例: ["images", "rootdir"])
}

// ZFSShareNFSRequest はZFS NFS公開リクエストです
type ZFSShareNFSRequest struct {
	PoolName   string `json:"pool_name"`   // ZFSプール名
	Network    string `json:"network"`     // 公開ネットワーク (例: "192.168.3.0/24")
	ReadWrite  bool   `json:"read_write"`  // RW権限の有無
	RootSquash bool   `json:"root_squash"` // ルートスクワッシュ設定
}

// StopNFSShareRequest はNFS公開停止リクエストです
type StopNFSShareRequest struct {
	StorageID string `json:"storage_id"` // ストレージID (例: "remote-poka")
	PoolName  string `json:"pool_name"`  // ZFSプール名 (例: "poka")
}

// RemoteNFSRegisterRequest はリモートNFS登録リクエストです
type RemoteNFSRegisterRequest struct {
	StorageName string   `json:"storage_name"` // ストレージ表示名
	ServerIP    string   `json:"server_ip"`    // NFSサーバーIP
	ExportPath  string   `json:"export_path"`  // エクスポートパス
	Content     []string `json:"content"`      // コンテンツタイプ
	NodeName    []string `json:"node_name"`    // 登録対象ノード
}

// ============================================================
// リクエスト型: VM管理
// ============================================================

// DiskConfig はディスク設定です
type DiskConfig struct {
	Device  string `json:"device"`  // デバイス識別子 (例: "scsi0")
	Storage string `json:"storage"` // ストレージID (例: "local-lvm")
	Size    string `json:"size"`    // ディスクサイズ (例: "50G")
}

// NetworkConfig はネットワーク設定です
type NetworkConfig struct {
	Bridge     string `json:"bridge"`      // ネットワークブリッジ (例: "vmbr0")
	Model      string `json:"model"`       // ドライバー (例: "virtio")
	MacAddress string `json:"mac_address"` // MACアドレス
	IPAddress  string `json:"ip_address"`  // IP設定 (例: "192.168.3.100/24")
	Gateway    string `json:"gateway"`     // ゲートウェイ
}

// VMCreateRequest はVM作成リクエストです
type VMCreateRequest struct {
	SourceVMID string          `json:"source_vmid"` // テンプレートVM ID
	NewVMID    string          `json:"new_vmid"`    // 新VM ID
	NewName    string          `json:"new_name"`    // 新VM名
	Cores      int             `json:"cores"`       // CPU コア数
	Memory     int             `json:"memory"`      // メモリ (MB)
	Disks      []DiskConfig    `json:"disks"`       // ディスク設定
	Networks   []NetworkConfig `json:"networks"`    // ネットワーク設定
	SSHKey     string          `json:"ssh_key"`     // SSH公開鍵
	AutoStart  bool            `json:"auto_start"`  // 自動起動設定
	InstallPackages []string `json:"install_packages"` // インストールパッケージ一覧
	FullClone  bool            `json:"full_clone"`  // フルクローン設定
}

// SecurityGroupAttachRequest はセキュリティグループ適用リクエストです
type SecurityGroupAttachRequest struct {
	VMID              string `json:"vmid"`               // VM ID
	NodeName          string `json:"node_name"`          // ノード名
	SecurityGroupName string `json:"security_group"`     // セキュリティグループ名
	SecurityGroupUUID string `json:"security_group_uuid"` // UUID
}

// SecurityGroupDetachRequest はセキュリティグループ削除リクエストです
type SecurityGroupDetachRequest struct {
	VMID              string `json:"vmid"`               // VM ID
	NodeName          string `json:"node_name"`          // ノード名
	SecurityGroupUUID string `json:"security_group_uuid"` // UUID
}

// ============================================================
// リクエスト型: バックアップ
// ============================================================

// RawDiskExportRequest はディスクバックアップリクエストです
type RawDiskExportRequest struct {
	VMID           string `json:"vmid"`             // VM ID
	SourceVolumeID string `json:"source_volume_id"` // ソースボリューム (例: "local-lvm:vm-105-disk-0")
	DestStorageID  string `json:"dest_storage_id"`  // 保存先ストレージ
	DestFilename   string `json:"dest_filename"`    // 出力ファイル名
}

// RestoreRequest はバックアップ復元リクエストです
type RestoreRequest struct {
	VMID           string `json:"vmid"`            // VM ID
	BackupPath     string `json:"backup_path"`     // バックアップファイルパス
	TargetVolumeID string `json:"target_volume_id"` // 復元先ボリューム
}
