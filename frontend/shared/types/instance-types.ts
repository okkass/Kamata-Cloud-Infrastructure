/**
 * インスタンスタイプ作成リクエストオブジェクト
 */
export interface InstanceTypeCreateRequest {
  /**
   * インスタンスタイプの名前
   */
  name: string;
  /**
   * CPUコア数
   */
  cpuCores: number;
  /**
   * メモリサイズ（バイト単位）
   */
  memorySize: number;
  /**
   * ストレージサイズ（バイト単位）
   */
  storageSize: number;
}
/**
 * インスタンスタイプ更新リクエストオブジェクト
 */
export interface InstanceTypeUpdateRequest {
  /**
   * インスタンスタイプの名前
   */
  name?: string;
  /**
   * CPUコア数
   */
  cpuCores?: number;
  /**
   * メモリサイズ（バイト単位）
   */
  memorySize?: number;
  /**
   * ストレージサイズ（バイト単位）
   */
  storageSize?: number;
}

/**
 * 仮想マシンのインスタンスタイプオブジェクト
 */
export interface ModelInstanceType {
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
  cpuCores: number;
  /**
   * メモリサイズ（バイト単位）
   */
  memorySize: number;
  /**
   * ストレージサイズ（バイト単位）
   */
  storageSize: number;
}
