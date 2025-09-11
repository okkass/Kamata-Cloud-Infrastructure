import type { ModelInstanceType, PhysicalNode } from ".";

/**
 * アタッチされたストレージオブジェクト
 */
export interface AttachedStorage {
  storage?: VirtualStorage;
  /**
   * ストレージデバイスのパス
   */
  path: string;
}

/**
 * バックアップオブジェクト
 */
export interface Backup {
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
  targetVirtualStorage: VirtualStorage;
}
/**
 * バックアップ作成リクエストオブジェクト
 */
export interface BackupCreateRequest {
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
export interface BackupRestoreRequest {
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
export interface NetworkInterface {
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
export interface Portfolio {
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
export interface PortfolioArticle {
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
export interface SnapShot {
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
  targetVirtualMachine: VirtualMachine;
}
/**
 * スナップショット作成リクエストオブジェクト
 */
export interface SnapShotCreateRequest {
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
export interface SnapShotRestoreRequest {
  /**
   * 復元するスナップショットのID
   */
  snapshotId: string;
}

/**
 * 仮想マシンオブジェクト
 */
export interface VirtualMachine {
  /**
   * 仮想マシンを識別するための一意なID
   */
  id: string;
  /**
   * 仮想マシンの名前
   */
  name: string;
  instanceType: ModelInstanceType;
  /**
   * 仮想マシンの状態
   */
  status: VirtualMachineStatusEnum;
  node?: PhysicalNode;
  /**
   * 仮想マシンが作成された日時
   */
  createdAt: string;
  /**
   * 仮想マシンに関連付けられたセキュリティグループのIDリスト
   */
  securityGroup: Array<string>;
  /**
   * アタッチされたストレージのリスト
   */
  attachedStorage: Array<AttachedStorage>;
  /**
   * アタッチされたネットワークインターフェースのリスト
   */
  attachedNic?: Array<NetworkInterface>;
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

export const VirtualMachineStatusEnum = {
  Running: "running",
  Stopped: "stopped",
  Suspended: "suspended",
} as const;

export type VirtualMachineStatusEnum =
  (typeof VirtualMachineStatusEnum)[keyof typeof VirtualMachineStatusEnum];

/**
 * 仮想マシン作成リクエストオブジェクト
 */
export interface VirtualMachineCreateRequest {
  /**
   * 仮想マシンの名前
   */
  name: string;
  /**
   * 使用するインスタンスタイプのID
   */
  instanceTypeId: string;
  /**
   * 仮想マシンを配置するサブネットのID
   */
  subnetId: string;
  /**
   * 仮想マシンに設定するSSH公開鍵
   */
  publicKey: string;
  /**
   * 使用する仮想マシンイメージのID
   */
  imageId: string;
  /**
   * インストールするミドルウェアのID
   */
  middleWareId?: string;
  /**
   * 仮想マシンにアタッチするストレージのリスト
   */
  storages: Array<VirtualMachineCreateRequestStoragesInner>;
  /**
   * 関連付けるセキュリティグループのIDリスト
   */
  securityGroupIds?: Array<string>;
}
export interface VirtualMachineCreateRequestStoragesInner {
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
export interface VirtualMachineUpdateRequest {
  /**
   * 仮想マシンの名前
   */
  name: string;
  instanceType?: ModelInstanceType;
  node?: PhysicalNode;
  /**
   * 仮想マシンが作成された日時
   */
  createdAt?: string;
  /**
   * 仮想マシンに関連付けられたセキュリティグループのIDリスト
   */
  securityGroup?: Array<string>;
  /**
   * アタッチされたストレージのリスト
   */
  attachedStorage?: Array<AttachedStorage>;
  /**
   * アタッチされたネットワークインターフェースのリスト
   */
  attachedNic?: Array<NetworkInterface>;
}

/**
 * 仮想ストレージオブジェクト
 */
export interface VirtualStorage {
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
