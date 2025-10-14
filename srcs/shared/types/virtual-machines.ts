import type {
  ModelInstanceTypeDTO,
  PhysicalNodeDTO,
  SecurityGroupDTO,
} from ".";

/**
 * アタッチされたストレージオブジェクト
 */
export interface AttachedStorageDTO {
  storage?: VirtualStorageDTO;
  /**
   * ストレージデバイスのパス
   */
  path: string;
}

/**
 * バックアップオブジェクト
 */
export interface BackupDTO {
  /**
   * バックアップを識別するための一意なID
   */
  id: string;
  /**
   * バックアップの名前
   */
  name: string;
  /**
   * バックアップの説明
   */
  description?: string;
  /**
   * バックアップが作成された日時
   */
  createdAt: string;
  /**
   * バックアップのサイズ
   */
  size: number;
  targetVirtualStorage: VirtualStorageDTO;
}
/**
 * バックアップ作成リクエストオブジェクト
 */
export interface BackupCreateRequestDTO {
  /**
   * バックアップの名前
   */
  name: string;
  /**
   * バックアップ対象の仮想ストレージのID
   */
  targetStorageId: string;
}
/**
 * バックアップ復元リクエストオブジェクト
 */
export interface BackupRestoreRequestDTO {
  /**
   * 復元するバックアップのID
   */
  backupId: string;
  /**
   * バックアップを復元する仮想マシンのID
   */
  targetVmId: string;
}

/**
 * ネットワークインターフェースオブジェクト
 */
export interface NetworkInterfaceDTO {
  /**
   * ネットワークインターフェースを識別するための一意なID
   */
  id?: string;
  /**
   * ネットワークインターフェースの名前
   */
  name?: string;
  /**
   * ネットワークインターフェースのMACアドレス
   */
  macAddress?: string;
  /**
   * ネットワークインターフェースのIPアドレス
   */
  ipAddress?: string;
  /**
   * ネットワークインターフェースが属するサブネットのID
   */
  subnetId?: string;
}

/**
 * ポートフォリオオブジェクト
 */
export interface PortfolioDTO {
  /**
   * ポートフォリオを識別するための一意なID
   */
  id?: string;
  /**
   * 過去24時間のビュー数
   */
  viewCount24Hour?: number;
  /**
   * 過去7日間のビュー数
   */
  viewCount7Day?: number;
}
/**
 * ポートフォリオ記事オブジェクト
 */
export interface PortfolioArticleDTO {
  /**
   * ポートフォリオ記事を識別するための一意なID
   */
  id?: string;
  /**
   * ポートフォリオ記事のタイトル
   */
  title?: string;
  /**
   * ポートフォリオ記事が作成された日時
   */
  createdAt?: string;
  status?: PortfolioArticleStatusEnum;
}

export const PortfolioArticleStatusEnum = {
  Published: "published",
  Draft: "draft",
} as const;

export type PortfolioArticleStatusEnum =
  (typeof PortfolioArticleStatusEnum)[keyof typeof PortfolioArticleStatusEnum];

/**
 * スナップショットオブジェクト
 */
export interface SnapShotDTO {
  /**
   * スナップショットを識別するための一意なID
   */
  id: string;
  /**
   * スナップショットの名前
   */
  name: string;
  /**
   * スナップショットの説明
   */
  description?: string;
  /**
   * スナップショットが作成された日時
   */
  createdAt: string;
  targetVirtualMachine: VirtualMachineDTO;
}
/**
 * スナップショット作成リクエストオブジェクト
 */
export interface SnapShotCreateRequestDTO {
  /**
   * スナップショットの名前
   */
  name: string;
  /**
   * スナップショットの説明
   */
  description?: string;
  /**
   * スナップショットを取得する仮想マシンのID
   */
  targetVmId: string;
}
/**
 * スナップショット復元リクエストオブジェクト
 */
export interface SnapShotRestoreRequestDTO {
  /**
   * 復元するスナップショットのID
   */
  snapshotId: string;
}

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
  node?: PhysicalNodeDTO;
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

export type VirtualMachineDTO =
  | VirtualMachineWithInstanceTypeDTO
  | VirtualMachineWithCustomConfigDTO;

export const VirtualMachineStatusEnum = {
  Running: "running",
  Stopped: "stopped",
  Suspended: "suspended",
} as const;

export type VirtualMachineStatusEnum =
  (typeof VirtualMachineStatusEnum)[keyof typeof VirtualMachineStatusEnum];

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

/**
 * 仮想マシン作成リクエストオブジェクト (パターンAまたはパターンBのどちらか)
 */
export type VirtualMachineCreateRequestDTO =
  | VirtualMachineCreateWithInstanceTypeRequest
  | VirtualMachineCreateWithCustomConfigRequest;

export interface VirtualMachineCreateRequestStoragesInnerDTO {
  /**
   * ストレージの名前
   */
  name: string;
  /**
   * ストレージのサイズ（バイト単位）
   */
  size: number;
  /**
   * ストレージプールのID
   */
  poolId: string;
  /**
   * バックアップから復元する場合のバックアップID
   */
  backupId?: string;
}
/**
 * 仮想マシン更新リクエストオブジェクト
 */
export interface VirtualMachineUpdateRequestDTO {
  /**
   * 仮想マシンの名前
   */
  name: string;
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

/**
 * 仮想ストレージオブジェクト
 */
export interface VirtualStorageDTO {
  /**
   * 仮想ストレージを識別するための一意なID
   */
  id?: string;
  /**
   * 仮想ストレージの名前
   */
  name?: string;
  /**
   * 仮想ストレージのサイズ（バイト単位）
   */
  size?: number;
  /**
   * 仮想ストレージが属するストレージプールのID
   */
  pool?: string;
}
