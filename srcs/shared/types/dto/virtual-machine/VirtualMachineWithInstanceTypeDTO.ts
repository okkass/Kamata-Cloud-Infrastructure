import type { VirtualMachineBaseDTO } from "./VirtualMachineBaseDTO";
import type { InstanceTypeDTO } from "../instance-type/InstanceTypeDTO";
/**
 * パターンA: インスタンスタイプを持ってる場合のオブジェクト
 */
export interface VirtualMachineWithInstanceTypeDTO
  extends VirtualMachineBaseDTO {
  instanceType: InstanceTypeDTO;
  /**
   * CPUコア数
   */
  cpuCore?: never;
  /**
   * メモリサイズ（バイト単位）
   */
  memorySize?: never;
}
