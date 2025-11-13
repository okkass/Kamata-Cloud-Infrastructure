/**
 * スナップショット作成リクエストオブジェクト
 */
export interface SnapShotCreateRequestDTO {
  /**
   * スナップショットの名前
   */
  name: string;
  /**
   * スナップショットの説明
   */
  description?: string;
  /**
   * スナップショットを取得する仮想マシンのID
   */
  targetVmId: string;
}
