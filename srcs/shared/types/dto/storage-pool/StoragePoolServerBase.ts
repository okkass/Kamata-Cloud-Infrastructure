/**
 * ストレージプールオブジェクト
 */
export interface StoragePoolServerBase {
  /**
   * ストレージプールを識別するための一意なID
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  id: string;

  /**
   * ストレージプールの名前
   * @example "Node1 Pool 1"
   */
  name: string;

  /**
   * ストレージプールが属する物理ノードのID
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  nodeId: string;

  /**
   * ストレージプールが作成された日時
   * @example "2024-01-01T12:00:00Z"
   */
  createdAt: string;

  /**
   * ストレージプールの総サイズ（バイト単位）
   * @example 1099511627776
   */
  totalSize: number;

  /**
   * ストレージプールの使用済みサイズ（バイト単位）
   * @example 549755813888
   */
  usedSize: number;

  /**
   * ストレージプールがネットワークアクセス可能かどうかを示すフラグ
   * @example true
   */
  hasNetworkAccess: boolean;
}