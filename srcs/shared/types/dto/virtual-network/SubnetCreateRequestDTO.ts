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
