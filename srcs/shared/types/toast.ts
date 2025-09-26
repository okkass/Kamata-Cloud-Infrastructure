import type { DeleteResult } from "./error";

export interface Toast {
  id: string;
  message: string;
  details?: Error | string | DeleteResult;
  type?: "success" | "error" | "info";
}

export interface ToastPayload {
  message: string;
  details?: Error | string | DeleteResult;
  type?: Toast["type"];
  duration?: number;
}
