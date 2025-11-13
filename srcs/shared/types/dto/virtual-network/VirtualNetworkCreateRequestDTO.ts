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
