/**
 * セキュリティグループ更新リクエストオブジェクト
 */
export interface SecurityGroupUpdateRequestDTO {
  /**
   * セキュリティグループの名前
   */
  name?: string;
  /**
   * セキュリティグループの説明
   */
  description?: string;
  rules?: Array<SecurityRuleDTO>;
}
