/**
 * サブネットオブジェクト
 */
export interface SubnetDTO {
  /**
   * サブネットを識別するための一意なID
   */
  id: string;
  /**
   * サブネットの名前
   */
  name: string;
  /**
   * CIDR形式のサブネットアドレス
   */
  cidr: string;
  /**
   * 外部接続が可能かどうかを示すフラグ
   */
  possibleExternalConnection: boolean;
  /**
   * サブネットが作成された日時
   */
  createdAt: string;
}
/**
 * サブネット作成リクエストオブジェクト
 */
export interface SubnetCreateRequestDTO {
  /**
   * サブネットの名前
   */
  name: string;
  /**
   * CIDR形式のサブネットアドレス
   */
  cidr: string;
  /**
   * 外部接続が可能かどうかを示すフラグ
   */
  possibleExternalConnection: boolean;
}
/**
 * サブネット更新リクエストオブジェクト
 */
export interface SubnetUpdateRequestDTO {
  /**
   * サブネットの名前
   */
  name?: string;
  /**
   * CIDR形式のサブネットアドレス
   */
  cidr?: string;
  /**
   * 外部接続が可能かどうかを示すフラグ
   */
  possibleExternalConnection?: boolean;
}
/**
 * TOTP情報オブジェクト
 */
export interface TotpInfoDTO {
  /**
   * TOTPシークレットキー
   */
  secret?: string;
  /**
   * TOTP URI（QRコード生成用）
   */
  uri?: string;
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
/**
 * 仮想ネットワークオブジェクト
 */
export interface VirtualNetworkDTO {
  /**
   * 仮想ネットワークを識別するための一意なID
   */
  id: string;
  /**
   * 仮想ネットワークの名前
   */
  name: string;
  /**
   * CIDR形式のネットワークアドレス
   */
  cidr: string;
  /**
   * 仮想ネットワークが作成された日時
   */
  createdAt: string;
  subnets?: Array<SubnetDTO>;
  /**
   * 仮想ネットワークのインバウンドトラフィック（bps単位）
   */
  inboundTraffic?: number;
  /**
   * 仮想ネットワークのアウトバウンドトラフィック（bps単位）
   */
  outboundTraffic?: number;
}
/**
 * 仮想ネットワーク作成リクエストオブジェクト
 */
export interface VirtualNetworkCreateRequestDTO {
  /**
   * 仮想ネットワークの名前
   */
  name: string;
  /**
   * CIDR形式のネットワークアドレス
   */
  cidr: string;
}
