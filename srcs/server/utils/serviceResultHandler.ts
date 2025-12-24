import type { ServiceError } from "@@/server/common/errors";
import type { Result } from "@@/server/common/type";
import { z } from "zod";
import { validateQuery, validateUUID, validateBody } from "./validate";
import type { BulkRequest } from "@@/server/types/BulkRequest";
import { InstanceTypeCreateRequest } from "@@/shared/types";
/**
 * Service 層から返却されたエラーを HTTP エラーに変換して投げる。
 * @param error Service 層で発生したエラー種別
 * @throws {Error} HTTP ステータスに対応する例外
 */
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
    case "NotImplemented":
      throw createError({
        statusCode: 501,
        statusMessage: "Not implemented",
      });
    default:
      throw createError({
        statusCode: 500,
        statusMessage: "Internal server error",
      });
  }
};

/**
 * リソース一覧取得ハンドラー。
 * @template T リスト要素の型
 * @param listFunc リスト取得関数（Service 層）
 * @param query クエリ文字列（任意）
 * @param querySchema クエリの Zod スキーマ（任意）
 * @returns バリデーション済みのリソース配列
 * @throws {Error} バリデーションエラーまたは Service エラーに対応する HTTP 例外
 */
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

/**
 * 単一リソース取得ハンドラー。
 * @template T 取得対象の型
 * @param resourceId リソース ID（UUID 期待）
 * @param getByIdFunc ID を受け取りリソースを返す Service 関数
 * @returns バリデーション済みのリソース
 * @throws {Error} バリデーションエラーまたは Service エラーに対応する HTTP 例外
 */
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

/**
 * リソース作成ハンドラー。
 * @template TRequest リクエストボディ型
 * @template TResponse 成功時レスポンス型
 * @param requestBody 作成リクエストボディ
 * @param bodySchema リクエストボディの Zod スキーマ
 * @param createFunc バリデーション済みボディで作成を行う Service 関数
 * @returns 作成後のリソース
 * @throws {Error} バリデーションエラーまたは Service エラーに対応する HTTP 例外
 */
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

/**
 * リソース更新ハンドラー（PUT/PATCH 共通）。
 * @template TRequest リクエストボディ型
 * @template TResponse 成功時レスポンス型
 * @param id リソース ID（UUID 期待）
 * @param requestBody 更新リクエストボディ
 * @param bodySchema リクエストボディの Zod スキーマ
 * @param updateFunc バリデーション済み ID/ボディで更新を行う Service 関数
 * @returns 更新後のリソース
 * @throws {Error} バリデーションエラーまたは Service エラーに対応する HTTP 例外
 */
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

/**
 * リソース削除ハンドラー。
 * @param id リソース ID（UUID 期待）
 * @param deleteFunc バリデーション済み ID で削除を行う Service 関数
 * @throws {Error} バリデーションエラーまたは Service エラーに対応する HTTP 例外
 */
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

export const bulkResource = <TCreate, TUpdate, TResponse>(
  body: BulkRequest<TCreate, TUpdate>,
  createSchema: z.ZodType,
  updateSchema: z.ZodType,
  createFunc: (params: TCreate) => Result<TResponse, ServiceError>,
  updateFunc:
    | ((id: string, params: TUpdate) => Result<TResponse, ServiceError>)
    | null,
  deleteFunc: (id: string) => Result<null, ServiceError>,
  listFunc: () => Result<TResponse[], ServiceError>
): TResponse[] => {
  // 追加処理
  for (const item of body.add) {
    createResource(item as TCreate, createSchema, createFunc);
  }
  // 更新処理
  for (const item of body.patch) {
    updateResource(item.id, item.data as TUpdate, updateSchema, updateFunc!);
  }
  // 削除処理
  for (const id of body.remove) {
    deleteResource(id, deleteFunc);
  }
  // 処理後のリストを返す
  return getResourceList(listFunc);
};
