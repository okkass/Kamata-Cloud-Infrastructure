/**
 * ストレージプール作成時のみ設定可能なプロパティ
 */
export interface StoragePoolCreateOnly {
  /**
   * ストレージプールが属する物理ノードのID
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  nodeId: string;

  /**
   * ストレージプールの総サイズ（バイト単位）
   * @example 1099511627776
   */
  totalSize: number;
}