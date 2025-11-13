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
