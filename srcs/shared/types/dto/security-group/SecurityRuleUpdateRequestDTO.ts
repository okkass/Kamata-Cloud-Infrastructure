/**
 * セキュリティルール更新リクエストオブジェクト
 */
export interface SecurityRuleUpdateRequestDTO {
  /**
   * セキュリティルールの名前
   */
  name?: string;
  /**
   * ルールのタイプ（インバウンドまたはアウトバウンド）
   */
  ruleType?: SecurityRuleRuleTypeEnum;
  /**
   * 適用されるポート番号
   */
  port?: number;
  /**
   * 適用されるプロトコル
   */
  protocol?: SecurityRuleProtocolEnum;
  /**
   * ターゲットIPアドレス
   */
  targetIp?: string;
  /**
   * アクション（許可または拒否）
   */
  action?: SecurityRuleActionEnum;
}
