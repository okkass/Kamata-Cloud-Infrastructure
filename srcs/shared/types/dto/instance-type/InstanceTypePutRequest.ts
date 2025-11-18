import type { InstanceTypeUpdatable } from "./InstanceTypeUpdatable";

/**
 * インスタンスタイプ更新リクエストオブジェクト(PUT)
 *
 * 完全更新で、以下のプロパティが必須になるにゃん。
 */
export type InstanceTypePutRequest = Omit<
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
