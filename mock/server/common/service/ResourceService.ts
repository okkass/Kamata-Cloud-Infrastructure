import type { Result } from "@/common/type";
import type { UserPermissions } from "@/types";

export type ResourceService<TResource, TCreate, TUpdate, TError> = {
  permission: UserPermissions;
  list(query?: string): Result<TResource[], TError>;
  getById(id: string): Result<TResource, TError>;
  create(data: TCreate): Result<TResource, TError>;
  update(id: string, data: TUpdate): Result<TResource, TError>;
  delete(id: string): Result<null, TError>;
};
