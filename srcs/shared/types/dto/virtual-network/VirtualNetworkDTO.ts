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
  inboundTraffic: number;
  /**
   * 仮想ネットワークのアウトバウンドトラフィック（bps単位）
   */
  outboundTraffic: number;
}
