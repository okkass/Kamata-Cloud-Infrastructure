export interface BulkRequest<TCreateRequest, TUpdateRequest> {
  add: TCreateRequest[];
  patch: { id: string; data: TUpdateRequest }[];
  remove: string[];
}
