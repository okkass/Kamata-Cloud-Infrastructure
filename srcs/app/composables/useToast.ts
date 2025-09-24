export const useToast = () => {
  const toasts = useState<Toast[]>("toast", () => []);

  const addToast = (payload: ToastPayload) => {
    const id = crypto.randomUUID();
    const type = payload.type || "info";
    toasts.value.push({ id, ...payload, type });
    const duration = payload.duration || (type === "error" ? 6000 : 3000);
    setTimeout(() => removeToast(id), duration);
  };

  const removeToast = (id: string) => {
    toasts.value = toasts.value.filter((toast) => toast.id !== id);
  };

  return {
    toasts,
    addToast,
    removeToast,
  };
};
