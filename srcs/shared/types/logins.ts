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
/**
 * TOTP情報オブジェクト
 */
export interface TotpInfoDTO {
  /**
   * TOTPシークレットキー
   */
  secret: string;
  /**
   * TOTP URI（QRコード生成用）
   */
  uri: string;
}
/**
 * TOTPログインリクエストオブジェクト
 */
export interface TotpLoginRequestDTO {
  /**
   * ユーザのメールアドレス
   */
  email: string;
  /**
   * TOTPコード
   */
  totpCode: string;
}
