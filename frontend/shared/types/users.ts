import type { TotpInfo } from ".";

/**
 * User object
 */
export interface User {
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
export interface UserCreateRequest {
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
  maxCpuCores?: number;
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
export interface UserUpdateRequest {
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
  maxCpuCores?: number;
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
export interface PasswordResetRequest {
  /**
   * パスワードリセットトークン
   */
  token: string;
  /**
   * 新しいパスワード
   */
  newPassword: string;
}
