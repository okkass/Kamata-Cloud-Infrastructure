import type { StoragePoolCreateOnly } from "./StoragePoolCreateOnly";
import type { StoragePoolUpdatable } from "./StoragePoolUpdatable";
/**
 * ストレージプール作成リクエストオブジェクト
 */
export interface StoragePoolCreateRequest
  extends StoragePoolCreateOnly,
    StoragePoolUpdatable {
  name: string;

  hasNetworkAccess: boolean;
}
