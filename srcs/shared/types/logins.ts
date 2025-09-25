export interface LoginPost200ResponseDTO {
  /**
   * 認証トークン
   */
  token: string;
}
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
