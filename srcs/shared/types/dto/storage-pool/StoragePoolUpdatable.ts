/**
 * ストレージプール更新可能なプロパティ
 */
export interface StoragePoolUpdatable {
  /**
   * ストレージプールの名前
   * @example "Node1 Pool 1"
   */
  name?: string;

  /**
   * ストレージプールがネットワークアクセス可能かどうかを示すフラグ
   * @example true
   */
  hasNetworkAccess?: boolean;
}