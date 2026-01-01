export type ServiceError = {
  reason:
    | "NotFound"
    | "BadRequest"
    | "InternalError"
    | "Forbidden"
    | "NotImplemented";
  message?: string;
};
