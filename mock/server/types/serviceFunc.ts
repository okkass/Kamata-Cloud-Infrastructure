import type { UserPermissions } from "./UserPermissions";
import type { ServiceResult } from "./ServiceResult";

interface FetchPayload {
  userPermissions: UserPermissions;
  query?: string;
  id?: string;
}

interface CreatePayload<T> {
  userPermissions: UserPermissions;
  body: T;
}

interface UpdatePayload<T> {
  userPermissions: UserPermissions;
  id: string;
  body: T;
}

interface DeletePayload {
  userPermissions: UserPermissions;
  id: string;
}

export type FetchFunc<T> = (payload: FetchPayload) => ServiceResult<T>;

export type CreateFunc<TRequest, TResponse> = (
  payload: CreatePayload<TRequest>
) => ServiceResult<TResponse>;

export type UpdateFunc<TRequest, TResponse> = (
  payload: UpdatePayload<TRequest>
) => ServiceResult<TResponse>;

export type DeleteFunc = (payload: DeletePayload) => ServiceResult<null>;
