export interface LoginResponseDTO {
  /**
   * 認証トークン
   */
  token: string;
  /**
   * リフレッシュトークン
   */
  refreshToken: string;
}
