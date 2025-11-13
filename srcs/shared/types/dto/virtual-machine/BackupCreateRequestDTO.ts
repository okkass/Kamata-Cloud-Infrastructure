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
