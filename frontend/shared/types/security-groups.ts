/**
 * セキュリティグループオブジェクト
 */
export interface SecurityGroup {
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
  rules?: Array<SecurityRule>;
  /**
   * セキュリティグループが作成された日時
   */
  createdAt: string;
}
/**
 * セキュリティグループ作成リクエストオブジェクト
 */
export interface SecurityGroupCreateRequest {
  /**
   * セキュリティグループの名前
   */
  name: string;
  /**
   * セキュリティグループの説明
   */
  description?: string;
  rules?: Array<SecurityRule>;
}
/**
 * セキュリティグループ更新リクエストオブジェクト
 */
export interface SecurityGroupUpdateRequest {
  /**
   * セキュリティグループの名前
   */
  name?: string;
  /**
   * セキュリティグループの説明
   */
  description?: string;
  rules?: Array<SecurityRule>;
}
/**
 * セキュリティルールオブジェクト
 */
export interface SecurityRule {
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
  port: number;
  /**
   * 適用されるプロトコル
   */
  protocol: SecurityRuleProtocolEnum;
  /**
   * ターゲットIPアドレス
   */
  targetIp: string;
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
} as const;

export type SecurityRuleProtocolEnum =
  (typeof SecurityRuleProtocolEnum)[keyof typeof SecurityRuleProtocolEnum];

/**
 * セキュリティルール作成リクエストオブジェクト
 */
export interface SecurityRuleCreateRequest {
  /**
   * セキュリティルールの名前
   */
  name: string;
  /**
   * ルールのタイプ（インバウンドまたはアウトバウンド）
   */
  ruleType: SecurityRuleCreateRequestRuleTypeEnum;
  /**
   * 適用されるポート番号
   */
  port: number;
  /**
   * 適用されるプロトコル
   */
  protocol: SecurityRuleCreateRequestProtocolEnum;
  /**
   * ターゲットIPアドレス
   */
  targetIp: string;
}

export const SecurityRuleCreateRequestRuleTypeEnum = {
  Inbound: "inbound",
  Outbound: "outbound",
} as const;

export type SecurityRuleCreateRequestRuleTypeEnum =
  (typeof SecurityRuleCreateRequestRuleTypeEnum)[keyof typeof SecurityRuleCreateRequestRuleTypeEnum];
export const SecurityRuleCreateRequestProtocolEnum = {
  Tcp: "tcp",
  Udp: "udp",
  Icmp: "icmp",
} as const;

export type SecurityRuleCreateRequestProtocolEnum =
  (typeof SecurityRuleCreateRequestProtocolEnum)[keyof typeof SecurityRuleCreateRequestProtocolEnum];

/**
 * セキュリティルール更新リクエストオブジェクト
 */
export interface SecurityRuleUpdateRequest {
  /**
   * セキュリティルールの名前
   */
  name?: string;
  /**
   * ルールのタイプ（インバウンドまたはアウトバウンド）
   */
  ruleType?: SecurityRuleUpdateRequestRuleTypeEnum;
  /**
   * 適用されるポート番号
   */
  port?: number;
  /**
   * 適用されるプロトコル
   */
  protocol?: SecurityRuleUpdateRequestProtocolEnum;
  /**
   * ターゲットIPアドレス
   */
  targetIp?: string;
}

export const SecurityRuleUpdateRequestRuleTypeEnum = {
  Inbound: "inbound",
  Outbound: "outbound",
} as const;

export type SecurityRuleUpdateRequestRuleTypeEnum =
  (typeof SecurityRuleUpdateRequestRuleTypeEnum)[keyof typeof SecurityRuleUpdateRequestRuleTypeEnum];
export const SecurityRuleUpdateRequestProtocolEnum = {
  Tcp: "tcp",
  Udp: "udp",
  Icmp: "icmp",
} as const;

export type SecurityRuleUpdateRequestProtocolEnum =
  (typeof SecurityRuleUpdateRequestProtocolEnum)[keyof typeof SecurityRuleUpdateRequestProtocolEnum];
