/**
 * 仮想マシン更新リクエストオブジェクト
 */
export interface VirtualMachineUpdateRequestDTO {
  /**
   * 仮想マシンの名前
   */
  name?: string;
  instanceType?: ModelInstanceTypeDTO;
  /**
   * CPUコア数
   */
  cpuCore?: number;
  /**
   * メモリサイズ（バイト単位）
   */
  memorySize?: number;
  /**
   * 仮想マシンに関連付けられたセキュリティグループのIDリスト
   */
  securityGroupIds?: Array<string>;
  /**
   * アタッチされたストレージのリスト
   */
  attachedStorages?: Array<AttachedStorageDTO>;
  /**
   * アタッチされたネットワークインターフェースのリスト
   */
  attachedNics?: Array<NetworkInterfaceDTO>;
}
