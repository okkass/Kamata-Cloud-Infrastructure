export interface LoginPost200ResponseDTO {
  /**
   * 認証トークン
   */
  token: string;
  /**
   * リフレッシュトークン
   */
  refreshToken: string;
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
