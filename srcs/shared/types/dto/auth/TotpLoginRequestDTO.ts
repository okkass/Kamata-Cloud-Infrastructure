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
