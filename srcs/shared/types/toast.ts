import type { DeleteResult } from "./results";

export type ToastType = "success" | "error" | "info" | "warning";

/** 実際にstateで管理されるトーストの型 */
export interface Toast extends ToastPayload {
  id: string;
}

/** addToastに渡すデータの型 */
export interface ToastPayload {
  message: string;
  details?: string | Error | DeleteResult;
  type: ToastType;
  duration?: number; // ミリ秒。指定しない場合はデフォルト値が使われる
  progress?: number; // 0〜100の進捗率。指定しない場合は表示されない
}