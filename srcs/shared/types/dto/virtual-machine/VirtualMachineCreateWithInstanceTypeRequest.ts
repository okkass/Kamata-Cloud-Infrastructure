/**
 * パターンA: インスタンスタイプIDを指定してVMを作成する場合のオブジェクト
 */
interface VirtualMachineCreateWithInstanceTypeRequest
  extends VirtualMachineCreateBaseRequest {
  /**
   * 使用するインスタンスタイプのID
   */
  instanceTypeId: string;
  /**
   * cpuCoreは存在してはならない
   */
  cpuCore?: never;
  /**
   * memorySizeは存在してはならない
   */
  memorySize?: never;
}
