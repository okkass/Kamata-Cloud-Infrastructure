export interface Toast {
  id: string;
  message: string;
  details?: string;
  type?: "success" | "error" | "info";
}

export interface ToastPayload {
  message: string;
  details?: string;
  type?: Toast["type"];
  duration?: number;
}