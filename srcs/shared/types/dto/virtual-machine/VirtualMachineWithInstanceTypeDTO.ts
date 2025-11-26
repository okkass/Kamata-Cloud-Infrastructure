import type { InstanceTypeResponse } from "../instance-type";
import type { VirtualMachineBaseDTO } from "./VirtualMachineBaseDTO";
/**
 * パターンA: インスタンスタイプを持ってる場合のオブジェクト
 */
export interface VirtualMachineWithInstanceTypeDTO
  extends VirtualMachineBaseDTO {
  instanceType: InstanceTypeResponse;
  /**
   * CPUコア数
   */
  cpuCore?: never;
  /**
   * メモリサイズ（バイト単位）
   */
  memorySize?: never;
}
