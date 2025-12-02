export interface VirtualMachineCreateRequestStoragesInnerDTO {
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
