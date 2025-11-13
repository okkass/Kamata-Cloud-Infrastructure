import type { SecurityRuleCreateRequestDTO } from ".";

/**
 * セキュリティグループ作成リクエストオブジェクト
 */
export interface SecurityGroupCreateRequestDTO {
  /**
   * セキュリティグループの名前
   */
  name: string;
  /**
   * セキュリティグループの説明
   */
  description?: string;
  rules?: Array<SecurityRuleCreateRequestDTO>;
}
