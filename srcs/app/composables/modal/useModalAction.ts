interface FormActionOptions<TReq, TRes> {
  execute: (payload: TReq) => Promise<{ success: boolean; error?: any }>;
  onSuccessMessage: (values: any) => string;
  onErrorMessage?: string;
  onSuccess?: () => void;
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

  
  const makeHandleClose =
    (resetForm: () => void, emit: (event: any) => void) => () => {
      resetForm();
      emit("close");
    };

  return { handleFormSubmit, makeHandleClose };
}
