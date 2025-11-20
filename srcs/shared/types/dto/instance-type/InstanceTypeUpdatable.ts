/**
 * インスタンスタイプのうち更新可能な情報を表すスキーマ
 *
 * 全てのプロパティは任意で、更新時に指定可能にゃん。
 */
export interface InstanceTypeUpdatable {
  /** インスタンスタイプの名前 */
  name?: string;

  /** CPUコア数 */
  cpuCore?: number;

  /** メモリサイズ（バイト単位） */
  memorySize?: number;
}
