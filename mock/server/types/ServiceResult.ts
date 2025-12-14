interface ServiceSuccessResult<T> {
  success: true;
  data: T;
}

interface ServiceErrorResult {
  success: false;
  error: Error;
}

export type ServiceResult<T> = ServiceSuccessResult<T> | ServiceErrorResult;
