import type { AttachedStorageDTO } from "./AttachedStorageDTO";
import type { NetworkInterfaceDTO } from "./NetworkInterfaceDTO";
import type { InstanceTypeResponse } from "../instance-type";
/**
 * 仮想マシン更新リクエストオブジェクト
 */
export interface VirtualMachineUpdateRequestDTO {
  /**
   * 仮想マシンの名前
   */
  name?: string;
  instanceType?: InstanceTypeResponse;
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
