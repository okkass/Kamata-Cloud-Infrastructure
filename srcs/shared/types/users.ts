import type { TotpInfo } from ".";

/**
 * User object
 */
export interface UserDTO {
  /**
   * ユーザを識別するための一意なID
   */
  id: string;
  /**
   * ユーザの名前
   */
  name: string;
  /**
   * ユーザのメールアドレス
   */
  email: string;
  /**
   * ユーザが作成された日時
   */
  createdAt?: string;
  /**
   * ユーザが管理者かどうかを示すフラグ
   */
  isAdmin?: boolean;
  /**
   * ユーザが最後にログインした日時
   */
  lastLoginAt?: string;
  TotpInfo?: TotpInfo;
}
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
}

/**
 * パスワードリセットリクエストオブジェクト
 */
export interface PasswordResetRequestDTO {
  /**
   * パスワードリセットトークン
   */
  token: string;
  /**
   * 新しいパスワード
   */
  newPassword: string;
}
