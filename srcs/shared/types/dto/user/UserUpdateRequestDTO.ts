/**
 * ユーザ更新リクエストオブジェクト
 */
export interface UserUpdateRequestDTO {
  /**
   * ユーザの名前
   */
  name?: string;
  /**
   * ユーザのメールアドレス
   */
  email?: string;
  /**
   * ユーザが使用できる最大CPUコア数
   */
  maxCpuCore?: number;
  /**
   * ユーザが使用できる最大メモリサイズ（バイト単位）
   */
  maxMemorySize?: number;
  /**
   * ユーザが使用できる最大ストレージサイズ（バイト単位）
   */
  maxStorageSize?: number;
  /**
   * ユーザが管理者かどうかを示すフラグ
   */
  isAdmin?: boolean;
}
