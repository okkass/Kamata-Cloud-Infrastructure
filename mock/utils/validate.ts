import { ErrorResponse } from "@app/shared/types";
import { z } from "zod";
import { create400Error } from "./errors";

type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: ErrorResponse };

// ボディーをバリデートしてエラーを返すユーティリティ関数
export const validateBody = <T>(
  requestBody: unknown,
  schema: z.ZodObject
): ValidationResult<T> => {
  const res = schema.safeParse(requestBody);
  if (!res.success) {
    return {
      success: false,
      error: create400Error(z.treeifyError(res.error).errors.join(", ")),
    };
  }

  return { success: true, data: res.data as T };
};

// UUIDをバリデートしてエラーを返すユーティリティ関数
export const validateUuid = (
  id: string | undefined
): ValidationResult<string> => {
  const uuidSchema = z.uuid();
  const res = uuidSchema.safeParse(id);
  if (!res.success) {
    return {
      success: false,
      error: create400Error(z.treeifyError(res.error).errors.join(", ")),
    };
  }
  return { success: true, data: res.data };
};

// クエリをバリデートしてエラーを返すユーティリティ関数
export const validateQuery = <T>(
  queryParams: unknown,
  schema: z.ZodObject
): ValidationResult<T> => {
  const res = schema.safeParse(queryParams);
  if (!res.success) {
    return {
      success: false,
      error: create400Error(z.treeifyError(res.error).errors.join(", ")),
    };
  }
  return { success: true, data: res.data as T };
};
