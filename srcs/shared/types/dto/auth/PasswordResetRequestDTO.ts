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
