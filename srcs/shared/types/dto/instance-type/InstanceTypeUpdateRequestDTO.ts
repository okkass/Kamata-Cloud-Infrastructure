/**
 * インスタンスタイプ更新リクエストオブジェクト
 */
export interface InstanceTypeUpdateRequestDTO {
  /**
   * インスタンスタイプの名前
   */
  name?: string;
  /**
   * CPUコア数
   */
  cpuCore?: number;
  /**
   * メモリサイズ（バイト単位）
   */
  memorySize?: number;
}
