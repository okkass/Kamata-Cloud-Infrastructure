import { u as useToast } from './server.mjs';

function useFormAction() {
  const { addToast } = useToast();
  const handleFormSubmit = (handleSubmit, options, emit) => {
    return handleSubmit(async (values) => {
      const payload = values;
      if (options.emitCloseImmediately) {
        options.onSuccess?.();
        emit("success");
        emit("close");
      }
      const result = await options.execute(payload);
      if (result.success) {
        addToast({
          message: options.onSuccessMessage(values),
          type: "success"
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
          details: result.error?.message
        });
      }
    });
  };
  const handleModalSubmit = async (asyncFn, options, emit) => {
    try {
      const payload = await asyncFn();
      if (options.emitCloseImmediately) {
        options.onSuccess?.();
        emit("success");
        emit("close");
      }
      const result = await options.execute(payload);
      if (result.success) {
        addToast({
          message: options.onSuccessMessage(payload),
          type: "success"
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
          details: result.error?.message
        });
      }
    } catch (error) {
      addToast({
        message: options.onErrorMessage || "処理に失敗しました。",
        type: "error",
        details: error?.message
      });
    }
  };
  const makeHandleClose = (resetForm, emit) => () => {
    resetForm();
    emit("close");
  };
  return { handleFormSubmit, handleModalSubmit, makeHandleClose };
}

export { useFormAction as u };
//# sourceMappingURL=useModalAction-CCl6IdMe.mjs.map
