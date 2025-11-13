/**
 * セキュリティルールオブジェクト
 */
export interface SecurityRuleDTO {
  /**
   * セキュリティルールを識別するための一意なID
   */
  id: string;
  /**
   * セキュリティルールの名前
   */
  name: string;
  /**
   * ルールのタイプ（インバウンドまたはアウトバウンド）
   */
  ruleType: SecurityRuleRuleTypeEnum;
  /**
   * 適用されるポート番号
   */
  port: number | null;
  /**
   * 適用されるプロトコル
   */
  protocol: SecurityRuleProtocolEnum;
  /**
   * ターゲットIPアドレス
   */
  targetIp: string;
  /**
   * アクション（許可または拒否）
   */
  action: SecurityRuleActionEnum;
  /**
   * セキュリティルールが作成された日時
   */
  createdAt: string;
}

export const SecurityRuleRuleTypeEnum = {
  Inbound: "inbound",
  Outbound: "outbound",
} as const;

export type SecurityRuleRuleTypeEnum =
  (typeof SecurityRuleRuleTypeEnum)[keyof typeof SecurityRuleRuleTypeEnum];
export const SecurityRuleProtocolEnum = {
  Tcp: "tcp",
  Udp: "udp",
  Icmp: "icmp",
  Any: "any",
} as const;

export type SecurityRuleProtocolEnum =
  (typeof SecurityRuleProtocolEnum)[keyof typeof SecurityRuleProtocolEnum];

export const SecurityRuleActionEnum = {
  Allow: "allow",
  Deny: "deny",
} as const;

export type SecurityRuleActionEnum =
  (typeof SecurityRuleActionEnum)[keyof typeof SecurityRuleActionEnum];
