import type { StoragePoolUpdatable } from "./StoragePoolUpdatable";
/**
 * ストレージプール更新リクエストオブジェクト(PUT)
 */
export interface StoragePoolPutRequest extends StoragePoolUpdatable {
  /**
   * ストレージプールの名前
   */
  name: string;

  /**
   * ストレージプールがネットワークアクセス可能かどうかを示すフラグ
   */
  hasNetworkAccess: boolean;
}
