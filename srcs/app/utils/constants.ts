/** データサイズの定数（バイト基準） */
export const KB_IN_BYTES = 1024;
export const MB_IN_BYTES = KB_IN_BYTES * 1024;
export const GB_IN_BYTES = MB_IN_BYTES * 1024;

/** 単位ごとの乗数 */
export const MB_PER_GB = 1024;
export const KB_PER_MB = 1024;

export const SNAPSHOT = { name: "snapshots", label: "スナップショット" };
export const BACKUP = { name: "backups", label: "バックアップ" };
export const MACHINE = { name: "virtual-machines", label: "仮想マシン" };
export const INSTANCE_TYPE = {
  name: "instance-types",
  label: "インスタンスタイプ",
};
export const STORAGE = { name: "storage-pools", label: "ストレージプール" };
export const NETWORK = { name: "virtual-networks", label: "仮想ネットワーク" };
export const IMAGE = { name: "images", label: "イメージ" };
export const USER = { name: "users", label: "ユーザー" };
export const ME = { name: "users/me", label: "自分自身" };
export const SECURITY_GROUP = {
  name: "security-groups",
  label: "セキュリティグループ",
};
export const MIDDLEWARE = { name: "middlewares", label: "ミドルウェア" };
export const NODE = { name: "nodes", label: "物理ノード" };
export const DISABLE_ROUNDING = false;
