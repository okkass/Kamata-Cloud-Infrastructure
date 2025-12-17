import type { FetchFunc, CreateFunc, UpdateFunc, DeleteFunc } from "@/types";
export interface ServiceController<TResponse, TCreateRequest, TUpdateRequest> {
  list: FetchFunc<TResponse[]>;
  getById: FetchFunc<TResponse>;
  create: CreateFunc<TCreateRequest, TResponse>;
  update: UpdateFunc<TUpdateRequest, TResponse>;
  remove: DeleteFunc;
}
