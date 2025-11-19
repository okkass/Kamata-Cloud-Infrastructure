/**
 * UserServerBase
 * User object
 */
export interface UserServerBase {
  /**
   * ユーザを識別するための一意なID
   * format: uuid
   */
  id: string;

  /**
   * ユーザの名前
   */
  name: string;

  /**
   * ユーザのメールアドレス
   * format: email
   */
  email: string;

  /**
   * ユーザが作成された日時
   * format: date-time
   */
  createdAt?: string;

  /**
   * ユーザが管理者かどうかを示すフラグ
   */
  isAdmin?: boolean;

  /**
   * ユーザが最後にログインした日時
   * format: date-time
   */
  lastLoginAt?: string;

  /**
   * ユーザが使用できる最大CPUコア数 制限がある場合だけ設定されます
   * example: 32
   */
  maxCpuCore?: number | null;

  /**
   * ユーザが使用できる最大メモリサイズ（バイト単位） 制限がある場合だけ設定されます
   * example: 17179869184
   */
  maxMemorySize?: number | null;

  /**
   * ユーザが使用できる最大ストレージサイズ（バイト単位） 制限がある場合だけ設定されます
   * example: 1099511627776
   */
  maxStorageSize?: number | null;

  /**
   * TotpInfo reference: ../auth/TotpInfo.yml
   * TODO: この参照はディレクトリ外のため解決できませんでした。適切な型（例: `TotpInfo`）に置き換えてくださいにゃん。
   */
  totpInfo?: unknown;

  /**
   * ユーザがイメージ管理者かどうかを示すフラグ
   * example: false
   */
  isImageAdmin: boolean;

  /**
   * ユーザがインスタンスタイプ管理者かどうかを示すフラグ
   * example: false
   */
  isInstanceTypeAdmin: boolean;

  /**
   * ユーザが物理ノード管理者かどうかを示すフラグ
   * example: false
   */
  isPhysicalNodeAdmin: boolean;

  /**
   * ユーザがセキュリティグループ管理者かどうかを示すフラグ
   * example: false
   */
  isSecurityGroupAdmin: boolean;

  /**
   * ユーザが仮想マシン管理者かどうかを示すフラグ
   * example: false
   */
  isVirtualMachineAdmin: boolean;

  /**
   * ユーザが仮想ネットワーク管理者かどうかを示すフラグ
   * example: false
   */
  isNetworkAdmin: boolean;
}
