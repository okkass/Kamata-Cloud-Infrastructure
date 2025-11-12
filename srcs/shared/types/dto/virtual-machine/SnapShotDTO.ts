/**
 * スナップショットオブジェクト
 */
export interface SnapShotDTO {
  /**
   * スナップショットを識別するための一意なID
   */
  id: string;
  /**
   * スナップショットの名前
   */
  name: string;
  /**
   * スナップショットの説明
   */
  description?: string;
  /**
   * スナップショットが作成された日時
   */
  createdAt: string;
  targetVirtualMachine: VirtualMachineDTO;
}
