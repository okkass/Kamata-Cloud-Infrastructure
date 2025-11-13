import type { VirtualStorageDTO } from "./VirtualStorageDTO";

/**
 * バックアップオブジェクト
 */
export interface BackupDTO {
  /**
   * バックアップを識別するための一意なID
   */
  id: string;
  /**
   * バックアップの名前
   */
  name: string;
  /**
   * バックアップの説明
   */
  description?: string;
  /**
   * バックアップが作成された日時
   */
  createdAt: string;
  /**
   * バックアップのサイズ
   */
  size: number;
  targetVirtualStorage: VirtualStorageDTO;
}
