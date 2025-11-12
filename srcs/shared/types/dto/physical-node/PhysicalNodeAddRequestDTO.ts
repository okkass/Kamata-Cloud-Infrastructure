/**
 * 物理ノード追加リクエストオブジェクト
 */
export interface PhysicalNodeAddRequestDTO {
  /**
   * 物理ノードの名前
   */
  name: string;
  /**
   * 物理ノードのIPアドレス
   */
  ipAddress: string;
  /**
   * 物理ノードが管理ノードかどうかを示すフラグ
   */
  isAdmin: boolean;
}
