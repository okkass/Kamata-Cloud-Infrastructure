/**
 * パスワード変更リクエストオブジェクト
 */
export interface PasswordChangeRequest {
  /**
   * 現在のパスワード
   */
  currentPassword: string;

  /**
   * 新しいパスワード
   */
  newPassword: string;
}
