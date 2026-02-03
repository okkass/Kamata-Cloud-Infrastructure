import type { ErrorResponse } from "~~/shared/types/api-types";
import type { H3Event } from "h3";
export const sendApiError = (event: H3Event, error: ErrorResponse) => {
  setResponseStatus(event, error?.status || 500);
  return error;
};
