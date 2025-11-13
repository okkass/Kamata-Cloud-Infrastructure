/**
 * 物理ノードオブジェクト
 */
export interface PhysicalNodeDTO {
  /**
   * 物理ノードを識別するための一意なID
   */
  id: string;
  /**
   * 物理ノードの名前
   */
  name: string;
  /**
   * 物理ノードのIPアドレス
   */
  ipAddress: string;
  /**
   * 物理ノードの状態
   */
  status: PhysicalNodeStatusEnum;
  /**
   * 物理ノードが管理ノードかどうかを示すフラグ
   */
  isAdmin: boolean;
  /**
   * 物理ノードが作成された日時
   */
  createdAt: string;
  /**
   * CPU使用率（0.0から1.0の範囲）
   */
  cpuUtilization?: number;
  /**
   * メモリ使用率（0.0から1.0の範囲）
   */
  memoryUtilization?: number;
  /**
   * ストレージ使用率（0.0から1.0の範囲）
   */
  storageUtilization?: number;
}

export const PhysicalNodeStatusEnum = {
  Active: "active",
  Inactive: "inactive",
} as const;

export type PhysicalNodeStatusEnum =
  (typeof PhysicalNodeStatusEnum)[keyof typeof PhysicalNodeStatusEnum];
