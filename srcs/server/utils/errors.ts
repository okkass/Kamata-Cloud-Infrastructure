import type { ErrorResponse } from "@@/shared/types";

export const create400Error = (message: string): ErrorResponse => {
  return {
    type: "BadRequest",
    status: 400,
    detail: message,
  };
};

export const create401Error = (message: string): ErrorResponse => {
  return {
    type: "Unauthorized",
    status: 401,
    detail: message,
  };
};

export const create403Error = (message: string): ErrorResponse => {
  return {
    type: "Forbidden",
    status: 403,
    detail: message,
  };
};

export const create404Error = (message: string): ErrorResponse => {
  return {
    type: "NotFound",
    status: 404,
    detail: message,
  };
};

export const create500Error = (message: string): ErrorResponse => {
  return {
    type: "InternalServerError",
    status: 500,
    detail: message,
  };
};

export const create501Error = (message: string): ErrorResponse => {
  return {
    type: "NotImplemented",
    status: 501,
    detail: message,
  };
};

export const create503Error = (message: string): ErrorResponse => {
  return {
    type: "ServiceUnavailable",
    status: 503,
    detail: message,
  };
};

export const createErrorResponse = (
  status: number,
  message: string
): ErrorResponse => {
  if (status == 400) return create400Error(message);
  if (status == 401) return create401Error(message);
  if (status == 403) return create403Error(message);
  if (status == 404) return create404Error(message);
  if (status == 500) return create500Error(message);
  if (status == 501) return create501Error(message);
  if (status == 503) return create503Error(message);
  return {
    type: "Error",
    status: status,
    detail: message,
  };
};
