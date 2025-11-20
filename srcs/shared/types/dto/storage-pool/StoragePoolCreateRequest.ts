import type { StoragePoolCreateOnly } from "./StoragePoolCreateOnly";
import type { StoragePoolUpdatable } from "./StoragePoolUpdatable";
/**
 * ストレージプール作成リクエストオブジェクト
 */
export interface StoragePoolCreateRequest
  extends StoragePoolCreateOnly,
    StoragePoolUpdatable {
  /**
   * ストレージプールの名前
   */
  name: string;

  /**
   * ストレージプールがネットワークアクセス可能かどうかを示すフラグ
   */
  hasNetworkAccess: boolean;
}
