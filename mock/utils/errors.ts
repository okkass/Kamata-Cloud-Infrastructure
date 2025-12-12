import { z } from "zod";
import type { ErrorResponse } from "@app/shared/types";

export const create400Error = (message?: string): ErrorResponse => {
  return {
    type: "Invalid request",
    detail: message || "Invalid request",
    status: 400,
  };
};

export const create404Error = (message?: string): ErrorResponse => {
  return {
    type: "Not Found",
    detail: message || "Resource not found",
    status: 404,
  };
};

export const create500Error = (message?: string): ErrorResponse => {
  return {
    type: "Internal Server Error",
    detail: message || "An unexpected error occurred",
    status: 500,
  };
};
