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

/** VM操作の確認メッセージ設定 */
export const VM_ACTION_CONFIRMATION = {
  stop: {
    title: "停止の確認",
    message:
      "仮想マシンを強制停止します。\n保存されていないデータは失われる可能性があります。\n本当に停止しますか？",
    confirmText: "停止する",
  },
  shutdown: {
    title: "シャットダウンの確認",
    message:
      "仮想マシンをシャットダウンします。\n実行中のプロセスが正常に終了するまで時間がかかる場合があります。\n本当にシャットダウンしますか？",
    confirmText: "シャットダウンする",
  },
  reboot: {
    title: "再起動の確認",
    message:
      "仮想マシンを再起動します。\n実行中のプロセスが正常に終了してから再起動します。\n本当に再起動しますか？",
    confirmText: "再起動する",
  },
  reset: {
    title: "リセットの確認",
    message:
      "仮想マシンを強制的にリセットします。\n保存されていないデータは失われる可能性があります。\n本当にリセットしますか？",
    confirmText: "リセットする",
  },
} as const;

/** VM操作の成功メッセージ */
export const VM_ACTION_SUCCESS = {
  start: "VMを起動しました",
  stop: "VMを停止しました",
  shutdown: "VMをシャットダウンしました",
  reboot: "VMを再起動しました",
  reset: "VMをリセットしました",
} as const;
