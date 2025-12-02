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
