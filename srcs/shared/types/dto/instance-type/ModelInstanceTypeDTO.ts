/**
 * 仮想マシンのインスタンスタイプオブジェクト
 */
export interface ModelInstanceTypeDTO {
  /**
   * インスタンスタイプを識別するための一意なID
   */
  id: string;
  /**
   * インスタンスタイプの名前
   */
  name: string;
  /**
   * インスタンスタイプが作成された日時
   */
  createdAt: string;
  /**
   * CPUコア数
   */
  cpuCore: number;
  /**
   * メモリサイズ（バイト単位）
   */
  memorySize: number;
}
