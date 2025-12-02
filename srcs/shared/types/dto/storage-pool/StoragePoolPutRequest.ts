import type { StoragePoolUpdatable } from "./StoragePoolUpdatable";
/**
 * ストレージプール更新リクエストオブジェクト(PUT)
 */
export interface StoragePoolPutRequest extends StoragePoolUpdatable {
  name: string;

  hasNetworkAccess: boolean;
}
