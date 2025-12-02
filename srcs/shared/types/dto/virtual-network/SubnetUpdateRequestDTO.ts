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
