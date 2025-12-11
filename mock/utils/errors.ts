import { z } from "zod";
import type { ErrorResponse } from "@app/shared/types";

export const create400Error = (error: z.ZodError): ErrorResponse => {
  return {
    type: "Invalid request",
    detail: z.treeifyError(error).errors.join(", "),
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
