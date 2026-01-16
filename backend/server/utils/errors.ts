import type { ErrorResponse } from "@app/shared/types";

export const create400Error = (
  message: string,
  detail?: string
): ErrorResponse => {
  return {
    type: "BadRequest",
    title: message,
    status: 400,
    detail: detail,
  };
};

export const create401Error = (
  message: string,
  detail?: string
): ErrorResponse => {
  return {
    type: "Unauthorized",
    status: 401,
    title: message,
    detail: detail,
  };
};

export const create403Error = (
  message: string,
  detail?: string
): ErrorResponse => {
  return {
    type: "Forbidden",
    status: 403,
    title: message,
    detail: detail,
  };
};

export const create404Error = (
  message: string,
  detail?: string
): ErrorResponse => {
  return {
    type: "NotFound",
    status: 404,
    title: message,
    detail: detail,
  };
};

export const create500Error = (
  message: string,
  detail?: string
): ErrorResponse => {
  return {
    type: "InternalServerError",
    status: 500,
    title: message,
    detail: detail,
  };
};

export const create501Error = (
  message: string,
  detail?: string
): ErrorResponse => {
  return {
    type: "NotImplemented",
    status: 501,
    title: message,
    detail: detail,
  };
};

export const create503Error = (
  message: string,
  detail?: string
): ErrorResponse => {
  return {
    type: "ServiceUnavailable",
    status: 503,
    title: message,
    detail: detail,
  };
};

export const createErrorResponse = (
  status: number,
  message: string,
  detail?: string
): ErrorResponse => {
  if (status == 400) return create400Error(message, detail);
  if (status == 401) return create401Error(message, detail);
  if (status == 403) return create403Error(message, detail);
  if (status == 404) return create404Error(message, detail);
  if (status == 500) return create500Error(message, detail);
  if (status == 501) return create501Error(message, detail);
  if (status == 503) return create503Error(message, detail);
  return {
    type: "Error",
    status: status,
    detail: message,
  };
};
