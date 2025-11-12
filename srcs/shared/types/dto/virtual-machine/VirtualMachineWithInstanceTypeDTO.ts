/**
 * パターンA: インスタンスタイプを持ってる場合のオブジェクト
 */
export interface VirtualMachineWithInstanceTypeDTO
  extends VirtualMachineBaseDTO {
  instanceType: ModelInstanceTypeDTO;
  /**
   * CPUコア数
   */
  cpuCore?: never;
  /**
   * メモリサイズ（バイト単位）
   */
  memorySize?: never;
}
