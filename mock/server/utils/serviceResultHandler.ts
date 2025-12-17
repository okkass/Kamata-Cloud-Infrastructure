import type { ServiceError } from "@/common/errors";
import type { Result } from "@/common/type";
import { z } from "zod";
import { validateQuery, validateUUID, validateBody } from "./validate";

const throwServiceError = (error: ServiceError): never => {
  switch (error) {
    case "NotFound":
      throw createError({
        statusCode: 404,
        statusMessage: "Resource not found",
      });
    case "BadRequest":
      throw createError({ statusCode: 400, statusMessage: "Bad request" });
    case "Forbidden":
      throw createError({ statusCode: 403, statusMessage: "Forbidden" });
    default:
      throw createError({
        statusCode: 500,
        statusMessage: "Internal server error",
      });
  }
};

// リソースのリストを取得する共通ハンドラー
export const getResourceList = <T>(
  listFunc: (query?: string) => Result<T[], ServiceError>,
  query?: string,
  querySchema?: z.ZodType
): T[] => {
  // queryがあればバリデート
  let validatedQuery: string | undefined = undefined;
  if (query && querySchema) {
    validatedQuery = validateQuery(query, querySchema);
  }

  // listFuncを呼び出す
  const result = listFunc(validatedQuery);

  // エラーが返ってきたら例外を投げる
  if (!result.success) {
    throwServiceError(result.error);
  }

  // この時点でresultは成功していることが保証されている
  return (result as { data: T[] }).data;
};

// 単一リソースを取得する共通ハンドラー
export const getResource = <T>(
  resourceId: string,
  getByIdFunc: (id: string) => Result<T, ServiceError>
): T => {
  // idをバリデート
  const validatedId = validateUUID(resourceId);

  // getByIdFuncを呼び出す
  const result = getByIdFunc(validatedId);

  // エラーが返ってきたら例外を投げる
  if (!result.success) {
    throwServiceError(result.error);
  }

  // この時点でresultは成功していることが保証されている
  return (result as { data: T }).data;
};

// リソースを新規作成する共通ハンドラー
export const createResource = <TRequest, TResponse>(
  requestBody: TRequest,
  bodySchema: z.ZodType,
  createFunc: (params: TRequest) => Result<TResponse, ServiceError>
): TResponse => {
  // bodyをバリデート
  const body = validateBody<TRequest>(requestBody, bodySchema);

  // createFuncを呼び出す
  const result = createFunc(body);

  // エラーが返ってきたら例外を投げる
  if (!result.success) {
    throwServiceError(result.error);
  }

  // この時点でresultは成功していることが保証されている
  return (result as { data: TResponse }).data;
};

// リソースを更新する共通ハンドラー(PUT/PATCH共通)
export const updateResource = <TRequest, TResponse>(
  id: string,
  requestBody: TRequest,
  bodySchema: z.ZodType,
  updateFunc: (id: string, params: TRequest) => Result<TResponse, ServiceError>
): TResponse => {
  // idをバリデート
  const validatedId = validateUUID(id);

  // bodyをバリデート
  const body = validateBody<TRequest>(requestBody, bodySchema);

  // updateFuncを呼び出す
  const result = updateFunc(validatedId, body);

  // エラーが返ってきたら例外を投げる
  if (!result.success) {
    throwServiceError(result.error);
  }

  // この時点でresultは成功していることが保証されている
  return (result as { data: TResponse }).data;
};

// リソースを削除する共通ハンドラー
export const deleteResource = (
  id: string,
  deleteFunc: (id: string) => Result<null, ServiceError>
): void => {
  // idをバリデート
  const validatedId = validateUUID(id);

  // deleteFuncを呼び出す
  const result = deleteFunc(validatedId);

  // エラーが返ってきたら例外を投げる
  if (!result.success) {
    throwServiceError(result.error);
  }

  // この時点でresultは成功していることが保証されている
  return;
};
