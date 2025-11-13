/**
 * ネットワークインターフェースオブジェクト
 */
export interface NetworkInterfaceDTO {
  /**
   * ネットワークインターフェースを識別するための一意なID
   */
  id: string;
  /**
   * ネットワークインターフェースの名前
   */
  name: string;
  /**
   * ネットワークインターフェースのMACアドレス
   */
  macAddress: string;
  /**
   * ネットワークインターフェースのIPアドレス
   */
  ipAddress: string;
  /**
   * ネットワークインターフェースが属するサブネットのID
   */
  subnetId: string;
}
