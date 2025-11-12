/**
 * 仮想ストレージオブジェクト
 */
export interface VirtualStorageDTO {
  /**
   * 仮想ストレージを識別するための一意なID
   */
  id: string;
  /**
   * 仮想ストレージの名前
   */
  name: string;
  /**
   * 仮想ストレージのサイズ（バイト単位）
   */
  size: number;
  /**
   * 仮想ストレージが属するストレージプールのID
   */
  poolId: string;
  /**
   * 仮想ストレージが作成された日時
   */
  createdAt?: Date;
}
