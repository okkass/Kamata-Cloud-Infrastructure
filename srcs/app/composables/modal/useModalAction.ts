interface FormActionOptions<TReq, TRes> {
  execute: (payload: TReq) => Promise<{ success: boolean; error?: any }>;
  onSuccessMessage: (values: any) => string;
  onErrorMessage?: string;
  onSuccess?: () => void;
  emitCloseImmediately?: boolean; // 送信直後にモーダルを閉じる（API結果待たず）
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

      // 送信直後にモーダルを閉じるオプションが有効な場合
      if (options.emitCloseImmediately) {
        options.onSuccess?.(); // resetFormなどを実行
        emit("success");
        emit("close");
      }

      // API実行
      const result = await options.execute(payload);

      // 結果処理
      if (result.success) {
        addToast({
          message: options.onSuccessMessage(values),
          type: "success",
        });

        if (!options.emitCloseImmediately) {
          options.onSuccess?.(); // resetFormなどを実行
          emit("success");
          emit("close");
        }
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

      // 送信直後にモーダルを閉じるオプションが有効な場合
      if (options.emitCloseImmediately) {
        options.onSuccess?.();
        emit("success");
        emit("close");
      }

      // 2. API実行
      const result = await options.execute(payload);

      // 3. 結果処理
      if (result.success) {
        addToast({
          message: options.onSuccessMessage(payload),
          type: "success",
        });

        if (!options.emitCloseImmediately) {
          options.onSuccess?.();
          emit("success");
          emit("close");
        }
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
