import type { InstanceTypeUpdatable } from "./InstanceTypeUpdatable";

/**
 * インスタンスタイプ更新リクエストオブジェクト(PATCH)
 *
 * 部分更新用のスキーマで、更新可能なフィールドを任意で指定できるにゃん。
 */
export type InstanceTypePatchRequest = InstanceTypeUpdatable;
