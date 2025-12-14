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

export type FetchFunc<T> = (payload: FetchPayload) => ServiceResult<T>;

export type CreateFunc<TRequest, TResponse> = (
  payload: CreatePayload<TRequest>
) => ServiceResult<TResponse>;
