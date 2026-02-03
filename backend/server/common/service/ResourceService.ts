import type { Result } from "@/common/type";

export type ResourceService<TResource, TCreate, TUpdate, TError> = {
  list(query?: string): Promise<Result<TResource[], TError>>;
  getById(id: string): Promise<Result<TResource, TError>>;
  create(data: TCreate): Promise<Result<TResource, TError>>;
  update(id: string, data: TUpdate): Promise<Result<TResource, TError>>;
  delete(id: string): Promise<Result<void, TError>>;
};
