const extractErrorMessage = (error, defaultMessage = "エラーが発生しました。") => {
  if (typeof error === "object" && error !== null) {
    const err = error;
    return err.data?.message ?? err.message ?? defaultMessage;
  }
  return defaultMessage;
};

export { extractErrorMessage as e };
//# sourceMappingURL=errorHandler-Bj20B0ou.mjs.map
