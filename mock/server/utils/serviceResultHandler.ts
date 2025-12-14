import type { FetchFunc, CreateFunc } from "@/types";
import { NotFoundError, ForbiddenError, UserPermissions } from "@/types";
import { validateQuery, validateUUID } from "./validate";
import { z } from "zod";

export interface HandlerResult<T> {
  status?: number;
  data: T;
}

const throwServiceError = (error: Error): never => {
  if (error instanceof NotFoundError) {
    throw createError({
      statusCode: 404,
      statusMessage: error.message || "Not Found",
    });
  }
  if (error instanceof ForbiddenError) {
    throw createError({
      statusCode: 403,
      statusMessage: error.message || "Forbidden",
    });
  }
  throw createError({
    statusCode: 500,
    statusMessage: error.message || "Internal Server Error",
  });
};

interface ResourceGetPayload<T> {
  userPermissions: UserPermissions;
  query?: string | undefined;
  querySchema?: z.ZodType;
  id?: string | undefined;
  fetchFunc: FetchFunc<T>;
}

interface ResourceCreatePayload<TRequest, TResponse> {
  userPermissions: UserPermissions;
  body: TRequest | undefined;
  bodySchema: z.ZodType;
  createFunc: CreateFunc<TRequest, TResponse>;
}

// リソースのリストを取得する共通ハンドラー
export const getResourceList = <T>(
  inparam: ResourceGetPayload<Array<T>>
): HandlerResult<Array<T>> => {
  // queryがあればバリデート
  let query: string | undefined = undefined;
  if (inparam.query && inparam.querySchema) {
    query = validateQuery(inparam.query, inparam.querySchema);
  }

  // fetchFuncを呼び出す
  const result = inparam.fetchFunc({
    userPermissions: inparam.userPermissions,
    query: query,
  });
  // エラーが返ってきたら例外を投げる
  if (!result.success) {
    throwServiceError(result.error);
  }

  // この時点でresultは成功していることが保証されている
  return { status: 200, data: (result as { data: Array<T> }).data };
};

// 単一リソースを取得する共通ハンドラー
export const getResource = <T>(
  inparam: ResourceGetPayload<T>
): HandlerResult<T> => {
  // idをバリデート
  const id = validateUUID(inparam.id);

  // fetchFuncを呼び出す
  const result = inparam.fetchFunc({
    userPermissions: inparam.userPermissions,
    id: id,
  });
  // エラーが返ってきたら例外を投げる
  if (!result.success) {
    throwServiceError(result.error);
  }

  // この時点でresultは成功していることが保証されている
  return { status: 200, data: (result as { data: T }).data };
};

// リソースを新規作成する共通ハンドラー
export const createResource = <TRequest, TResponse>(
  inparam: ResourceCreatePayload<TRequest, TResponse>
): HandlerResult<TResponse> => {};
