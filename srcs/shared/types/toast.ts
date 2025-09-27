import type { DeleteResult } from "./results";

export interface Toast {
  id: string;
  message: string;
  details?: Error | string | DeleteResult;
  type?: "success" | "error" | "info";
}

/** addToastに渡すデータの型 */
export interface ToastPayload {
  message: string;
  details?: string;
  type?: ToastType;
  duration?: number;
}

/** 実際にstateで管理されるトーストの型 */
export interface Toast extends ToastPayload {
  id: string;
  type: ToastType; // typeは必須項目にする
}
