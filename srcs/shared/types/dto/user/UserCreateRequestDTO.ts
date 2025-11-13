/**
 * ユーザ作成リクエストオブジェクト
 */
export interface UserCreateRequestDTO {
  /**
   * ユーザの名前
   */
  name: string;
  /**
   * ユーザのメールアドレス
   */
  email: string;
  /**
   * ユーザのパスワード
   */
  password: string;
  /**
   * TOTPを使用するかどうかを示すフラグ
   */
  useTOTP: boolean;
  /**
   * ユーザが管理者かどうかを示すフラグ
   */
  isAdmin: boolean;
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
}
