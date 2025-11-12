/**
 * アタッチされたストレージオブジェクト
 */
export interface AttachedStorageDTO {
  /**
   * アタッチされたストレージを識別するための一意なID
   */
  id: string;
  /**
   * アタッチされたストレージに関する情報
   */
  storage?: VirtualStorageDTO;
  /**
   * ストレージデバイスのパス
   */
  path: string;
}
