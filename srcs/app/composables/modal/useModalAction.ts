interface FormActionOptions<TReq, TRes> {
  execute: (payload: TReq) => Promise<{ success: boolean; error?: any }>;
  onSuccessMessage: (values: any) => string;
  onErrorMessage?: string;
  onSuccess?: () => void;
}

interface ModalActionOptions<TReq>
  extends Omit<FormActionOptions<TReq, any>, "execute"> {
  execute: (payload: TReq) => Promise<{ success: boolean; error?: any }>;
}

export function useFormAction() {
  const { addToast } = useToast();

  const handleFormSubmit = <TReq, TRes>(
    handleSubmit: any,
    options: FormActionOptions<TReq, TRes>,
    emit: (event: any) => void
  ) => {
    return handleSubmit(async (values: any) => {
      const payload = values as TReq;

      // 2. API実行
      const result = await options.execute(payload);

      // 3. 結果処理
      if (result.success) {
        addToast({
          message: options.onSuccessMessage(values),
          type: "success",
        });

        options.onSuccess?.(); // resetFormなどを実行
        emit("success");
        emit("close");
      } else {
        addToast({
          message: options.onErrorMessage || "処理に失敗しました。",
          type: "error",
          details: result.error?.message,
        });
      }
    });
  };

  /**
   * ウィザード形式のモーダル送信を処理
   * handleSubmitがない場合（バリデーション不要の場合）に使用
   */
  const handleModalSubmit = async <TReq>(
    asyncFn: () => Promise<TReq>,
    options: ModalActionOptions<TReq>,
    emit: (event: any) => void
  ) => {
    try {
      // 1. ペイロード取得（バリデーション含む）
      const payload = await asyncFn();

      // 2. API実行
      const result = await options.execute(payload);

      // 3. 結果処理
      if (result.success) {
        addToast({
          message: options.onSuccessMessage(payload),
          type: "success",
        });

        options.onSuccess?.();
        emit("success");
        emit("close");
      } else {
        addToast({
          message: options.onErrorMessage || "処理に失敗しました。",
          type: "error",
          details: result.error?.message,
        });
      }
    } catch (error: any) {
      addToast({
        message: options.onErrorMessage || "処理に失敗しました。",
        type: "error",
        details: error?.message,
      });
    }
  };

  const makeHandleClose =
    (resetForm: () => void, emit: (event: any) => void) => () => {
      resetForm();
      emit("close");
    };

  return { handleFormSubmit, handleModalSubmit, makeHandleClose };
}
