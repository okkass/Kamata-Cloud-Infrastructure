import type { TotpInfoDTO } from "../auth/TotpInfoDTO";

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

  totpInfo?: TotpInfoDTO;
}
