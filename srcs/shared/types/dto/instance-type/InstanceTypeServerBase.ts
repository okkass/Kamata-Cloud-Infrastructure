/**
 * 仮想マシンのインスタンスタイプオブジェクト
 */
export interface InstanceTypeServerBase {
  /** インスタンスタイプを識別するための一意なID */
  id: string; // uuid

  /** インスタンスタイプの名前 */
  name: string;

  /** インスタンスタイプが作成された日時 (ISO 8601) */
  createdAt: string; // date-time

  /** CPUコア数 */
  cpuCore: number;

  /** CPUソケット数 */
  cpuSocket: number;

  /** メモリサイズ（バイト単位） */
  memorySize: number;
}
