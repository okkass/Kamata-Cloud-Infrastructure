interface Toast {
  id: number;
  message: string;
  details?: string;
  type?: "success" | "error" | "info";
}

interface ToastPayload {
  message: string;
  details?: string;
  type?: Toast["type"];
}

export const useToast = () => {
  const toasts = useState<Toast[]>("toast", () => []);

  const addToast = (payload: ToastPayload) => {
    const id = new Date().getTime();
    const type = payload.type || "info";
    toasts.value.push({ id, ...payload, type });
    const duration = payload.type === "error" ? 8000 : 4000;
    setTimeout(() => removeToast(id), duration);
  };

  const removeToast = (id: number) => {
    toasts.value = toasts.value.filter((toast) => toast.id !== id);
  };

  return {
    toasts,
    addToast,
    removeToast,
  };
};
