/**
 * ユーザの更新可能プロパティ
 */
export interface UserUpdatable {
  /**
   * ユーザの表示名
   */
  name?: string;

  /**
   * ユーザのメールアドレス
   * format: email
   */
  email?: string;

  /**
   * ユーザが管理者権限を持つかどうか
   */
  isAdmin?: boolean;

  /**
   * ユーザがイメージ管理者かどうかを示すフラグ
   * example: false
   */
  isImageAdmin?: boolean;

  /**
   * ユーザがインスタンスタイプ管理者かどうかを示すフラグ
   * example: false
   */
  isInstanceTypeAdmin?: boolean;

  /**
   * ユーザが物理ノード管理者かどうかを示すフラグ
   * example: false
   */
  isPhysicalNodeAdmin?: boolean;
  /**
   * ユーザが仮想マシン管理者かどうかを示すフラグ
   */
  isVirtualMachineAdmin?: boolean;
  /**
   * ユーザがネットワーク管理者かどうかを示すフラグ
   */
  isNetworkAdmin?: boolean;
  /**
   * ユーザがセキュリティグループ管理者かどうかを示すフラグ
   */
  isSecurityGroupAdmin?: boolean;
  /**
   * ユーザが使用できる最大CPUコア数 制限がある場合だけ設定されます
   */
  maxCpuCore?: number | null;

  /**
   * ユーザが使用できる最大メモリサイズ（バイト単位） 制限がある場合だけ設定されます
   */
  maxMemorySize?: number | null;

  /**
   * ユーザが使用できる最大ストレージサイズ（バイト単位） 制限がある場合だけ設定されます
   */
  maxStorageSize?: number | null;
}
