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
  totpInfo?: TotpInfoDTO;
}
