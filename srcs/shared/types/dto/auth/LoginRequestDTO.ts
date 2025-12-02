/**
 * ログインリクエストオブジェクト
 */
export interface LoginRequestDTO {
  /**
   * ユーザのメールアドレス
   */
  email: string;
  /**
   * ユーザのパスワード
   */
  password: string;
}
