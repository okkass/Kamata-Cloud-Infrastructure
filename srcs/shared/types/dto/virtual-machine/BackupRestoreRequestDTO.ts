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
