export type ServiceError = {
  reason:
    | "NotFound"
    | "BadRequest"
    | "InternalError"
    | "Forbidden"
    | "Unauthorized"
    | "NotImplemented";
  message?: string;
};
