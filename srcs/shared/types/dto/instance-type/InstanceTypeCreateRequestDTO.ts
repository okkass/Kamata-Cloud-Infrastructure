/**
 * インスタンスタイプ作成リクエストオブジェクト
 */
export interface InstanceTypeCreateRequestDTO {
  /**
   * インスタンスタイプの名前
   */
  name: string;
  /**
   * CPUコア数
   */
  cpuCore: number;
  /**
   * メモリサイズ（バイト単位）
   */
  memorySize: number;
}
