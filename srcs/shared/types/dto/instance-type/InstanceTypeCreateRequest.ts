import type { InstanceTypeUpdatable } from "./InstanceTypeUpdatable";

/**
 * インスタンスタイプ作成リクエストオブジェクト
 *
 * `InstanceTypeUpdatable` を継承し、作成時に必須のプロパティを上書きして必須化しているにゃん。
 */
export type InstanceTypeCreateRequest = Omit<
  InstanceTypeUpdatable,
  "name" | "cpuCore" | "cpuSocket" | "memorySize"
> & {
  /** インスタンスタイプの名前 */
  name: string;

  /** CPUコア数 */
  cpuCore: number;

  /** CPUソケット数 */
  cpuSocket: number;

  /** メモリサイズ（バイト単位） */
  memorySize: number;
};
