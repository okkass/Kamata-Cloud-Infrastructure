/**
 * ストレージプールオブジェクト
 */
export interface StoragePoolDTO {
  /**
   * ストレージプールを識別するための一意なID
   */
  id: string;
  /**
   * ストレージプールの名前
   */
  name: string;
  type?: StoragePoolTypeEnum;
  /**
   * ストレージプールが作成された日時
   */
  createdAt: string;
  /**
   * ストレージプールの総サイズ（バイト単位）
   */
  totalSize: number;
  /**
   * 使用中のストレージサイズ（バイト単位）
   */
  usedSize: number;
}

export const StoragePoolTypeEnum = {
  Local: "local",
  Network: "network",
} as const;

export type StoragePoolTypeEnum =
  (typeof StoragePoolTypeEnum)[keyof typeof StoragePoolTypeEnum];

/**
 * ストレージプール作成リクエストオブジェクト
 */
export interface StoragePoolCreateRequestDTO {
  /**
   * ストレージプールの名前
   */
  name: string;
  type: StoragePoolCreateRequestTypeEnum;
  /**
   * ストレージプールを作成する物理ノードのID
   */
  nodeId: string;
  /**
   * ストレージプールのサイズ（バイト単位）
   */
  size: number;
  /**
   * ストレージデバイスのパス（ローカルストレージの場合）
   */
  devFile?: string;
  /**
   * 使用するローカルストレージのID（ネットワークストレージの場合）
   */
  localStorageId?: string;
}

export const StoragePoolCreateRequestTypeEnum = {
  Local: "local",
  Network: "network",
} as const;

export type StoragePoolCreateRequestTypeEnum =
  (typeof StoragePoolCreateRequestTypeEnum)[keyof typeof StoragePoolCreateRequestTypeEnum];
