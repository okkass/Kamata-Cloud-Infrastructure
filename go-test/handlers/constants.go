package handlers

const (
	// サーバー設定
	Port      = ":8080"
	AuthToken = "f3b1435b-1d83-45c8-b95b-eb4b5276be0e" // 認証トークン

	// デフォルト設定
	DefaultBridge  = "vmbr0"
	DefaultStorage = "local-lvm"

	// パス設定
	IsoPath     = "/var/lib/vz/template/iso"
	ExportsFile = "/etc/exports"
	FstabFile   = "/etc/fstab"
)
