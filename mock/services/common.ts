import type { ErrorResponse } from "@app/shared/types";

export interface SuccessResult<T> {
  success: true;
  data: T;
  status?: number;
}

export interface ErrorResult {
  success: false;
  error: ErrorResponse;
  status?: number;
}

export type ServiceResult<T> = SuccessResult<T> | ErrorResult;
