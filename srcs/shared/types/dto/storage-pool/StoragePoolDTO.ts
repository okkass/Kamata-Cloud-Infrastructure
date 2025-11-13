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
  /**
   * ストレージプールが属する物理ノードのID
   */
  nodeId: string;
  /**
   * ストレージプールが作成された日時
   */
  createdAt?: string;
  /**
   * ストレージプールの総サイズ（バイト単位）
   */
  totalSize: number;
  /**
   * 使用中のストレージサイズ（バイト単位）
   */
  usedSize: number;
  /**
   * ストレージプールがネットワークアクセス可能かどうかを示すフラグ
   */
  hasNetworkAccess: boolean;
}
