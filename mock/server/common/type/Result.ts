interface SuccessResult<T> {
  success: true;
  data: T;
}

interface ErrorResult<E> {
  success: false;
  error: E;
}

type Result<T, E> = SuccessResult<T> | ErrorResult<E>;

export { Result, SuccessResult, ErrorResult };
