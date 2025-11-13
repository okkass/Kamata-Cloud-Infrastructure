import type { SecurityRuleDTO } from ".";
/**
 * セキュリティグループオブジェクト
 */
export interface SecurityGroupDTO {
  /**
   * セキュリティグループを識別するための一意なID
   */
  id: string;
  /**
   * セキュリティグループの名前
   */
  name: string;
  /**
   * セキュリティグループの説明
   */
  description?: string;
  rules?: Array<SecurityRuleDTO>;
  /**
   * セキュリティグループが作成された日時
   */
  createdAt: string;
}
