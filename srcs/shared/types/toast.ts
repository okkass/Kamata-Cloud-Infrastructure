import type { DeleteResult } from "./results";

export type ToastType = "success" | "error" | "info" | "warning";

/** 実際にstateで管理されるトーストの型 */
export interface Toast {
  id: string;
  message: string;
  details?: Error | string | DeleteResult;
  type: ToastType; // typeは必須項目にする
  duration: number; // ミリ秒
}

/** addToastに渡すデータの型 */
export interface ToastPayload {
  message: string;
  details?: string | Error | DeleteResult;
  type?: ToastType;
  duration?: number; // ミリ秒。指定しない場合はデフォルト値が使われる
}
