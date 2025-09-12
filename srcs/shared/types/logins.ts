export interface LoginPost200Response {
  /**
   * 認証トークン
   */
  token: string;
}
/**
 * ログインリクエストオブジェクト
 */
export interface LoginRequest {
  /**
   * ユーザのメールアドレス
   */
  email: string;
  /**
   * ユーザのパスワード
   */
  password: string;
}
