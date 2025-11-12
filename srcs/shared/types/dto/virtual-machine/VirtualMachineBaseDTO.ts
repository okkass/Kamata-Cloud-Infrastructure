/**
 * 仮想マシンオブジェクト(ベース)
 */
export interface VirtualMachineBaseDTO {
  /**
   * 仮想マシンを識別するための一意なID
   */
  id: string;
  /**
   * 仮想マシンの名前
   */
  name: string;
  /**
   * 仮想マシンの状態
   */
  status: VirtualMachineStatusEnum;
  node: PhysicalNodeDTO;
  /**
   * 仮想マシンが作成された日時
   */
  createdAt: string;
  /**
   * 仮想マシンに関連付けられたセキュリティグループのIDリスト
   */
  securityGroups: Array<SecurityGroupDTO>;
  /**
   * アタッチされたストレージのリスト
   */
  attachedStorages: Array<AttachedStorageDTO>;
  /**
   * アタッチされたネットワークインターフェースのリスト
   */
  attachedNics?: Array<NetworkInterfaceDTO>;
  /**
   * CPU使用率（0.0から1.0の範囲）
   */
  cpuUtilization?: number;
  /**
   * メモリ使用率（0.0から1.0の範囲）
   */
  memoryUtilization?: number;
  /**
   * ストレージ使用率（0.0から1.0の範囲）
   */
  storageUtilization?: number;
}
