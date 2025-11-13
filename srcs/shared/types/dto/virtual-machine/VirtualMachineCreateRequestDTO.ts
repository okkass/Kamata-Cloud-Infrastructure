import type { VirtualMachineCreateRequestStoragesInnerDTO } from "./VirtualMachineCreateRequestStoragesInnerDTO";
/**
 * 仮想マシン作成リクエストオブジェクト (パターンAまたはパターンBのどちらか)
 */
export type VirtualMachineCreateRequestDTO =
  | VirtualMachineCreateWithInstanceTypeRequest
  | VirtualMachineCreateWithCustomConfigRequest;

/**
 * 仮想マシン作成リクエストの共通ベースオブジェクト
 */
interface VirtualMachineCreateBaseRequest {
  /**
   * 仮想マシンの名前
   */
  name: string;
  /**
   * 仮想マシンを収容する物理ノードのID
   */
  nodeId: string;
  /**
   * 仮想マシンを配置するサブネットのID
   */
  subnetId: string;
  /**
   * 仮想マシンに設定するSSH公開鍵
   */
  publicKey: string | null;
  /**
   * 使用する仮想マシンイメージのID
   */
  imageId: string | null;
  /**
   * インストールするミドルウェアのID
   */
  middleWareId?: string | null;
  /**
   * 仮想マシンにアタッチするストレージのリスト
   */
  storages: Array<VirtualMachineCreateRequestStoragesInnerDTO>;
  /**
   * 関連付けるセキュリティグループのIDリスト
   */
  securityGroupIds?: Array<string> | null;
}
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
