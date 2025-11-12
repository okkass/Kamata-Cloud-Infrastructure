/**
 * パターンB: CPUとメモリをカスタム指定してVMを作成する場合のオブジェクト
 */
interface VirtualMachineCreateWithCustomConfigRequest
  extends VirtualMachineCreateBaseRequest {
  /**
   * instanceTypeIdは存在してはならない
   */
  instanceTypeId?: never;
  /**
   * CPUコア数
   */
  cpuCore: number;
  /**
   * メモリサイズ（バイト単位）
   */
  memorySize: number;
}
