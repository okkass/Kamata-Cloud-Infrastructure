import type { ErrorResponse } from "@app/shared/types";
import { string, z } from "zod";
import { create400Error, create404Error } from "./errors";

// ID指定でリソースを取得するユーティリティ関数
export const getResourceById = <T>(
  id: string,
  fetchFunction: (id: string) => T | undefined
): T | ErrorResponse => {
  const uuidSchema = z.uuid();
  const res = uuidSchema.safeParse(id);
  if (!res.success) {
    return create400Error(res.error);
  }
  const resourceId = res.data;
  const resource = fetchFunction(resourceId);
  if (!resource) {
    return create404Error("Resource with the specified ID not found");
  }
  return resource;
};

// リソースを新規作成するユーティリティ関数
export const createResource = <TInput, TOutput>(
  requestBody: unknown,
  schema: z.ZodObject,
  createFunction: (data: TInput) => TOutput
): TOutput | ErrorResponse => {
  const res = schema.safeParse(requestBody);
  if (!res.success) {
    return {
      type: "Invalid request",
      detail: z.treeifyError(res.error).errors.join(", "),
      status: 400,
    };
  }
  const inputData = res.data as TInput;
  const newResource = createFunction(inputData);
  return newResource;
};

// リソースを更新するユーティリティ関数
export const updateResource = <TInput, TOutput>(
  id: string,
  requestBody: unknown,
  schema: z.ZodObject,
  updateFunction: (id: string, data: TInput) => TOutput | undefined
): TOutput | ErrorResponse => {
  const uuidSchema = z.uuid();
  const idRes = uuidSchema.safeParse(id);
  if (!idRes.success) {
    return create400Error(idRes.error);
  }

  const res = schema.safeParse(requestBody);
  if (!res.success) {
    return create400Error(res.error);
  }
  const inputData = res.data as TInput;
  const updatedResource = updateFunction(idRes.data, inputData);
  if (!updatedResource) {
    return create404Error("Resource with the specified ID not found");
  }
  return updatedResource;
};

// リソースを削除するユーティリティ関数
export const deleteResource = (
  id: string,
  deleteFunction: (id: string) => boolean
): boolean | ErrorResponse => {
  const uuidSchema = z.uuid();
  const res = uuidSchema.safeParse(id);
  if (!res.success) {
    return create400Error(res.error);
  }
  const resourceId = res.data;
  const deleted = deleteFunction(resourceId);
  return deleted;
};
