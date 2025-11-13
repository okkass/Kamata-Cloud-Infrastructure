import type { VirtualMachineBaseDTO } from "./VirtualMachineBaseDTO";
/**
 * パターンB: CPUとメモリをカスタム指定している場合のオブジェクト
 */
export interface VirtualMachineWithCustomConfigDTO
  extends VirtualMachineBaseDTO {
  instanceType?: never;
  /**
   * CPUコア数
   */
  cpuCore: number;
  /**
   * メモリサイズ（バイト単位）
   */
  memorySize: number;
}
