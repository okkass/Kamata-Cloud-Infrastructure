export interface Toast {
  id: string;
  message: string;
  details?: Error | string;
  type?: "success" | "error" | "info";
}

export interface ToastPayload {
  message: string;
  details?: Error | string;
  type?: Toast["type"];
  duration?: number;
}
