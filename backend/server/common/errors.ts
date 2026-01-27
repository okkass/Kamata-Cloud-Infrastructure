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

export type RepositoryError = {
  reason: "BadRequest" | "Conflict" | "NotFound" | "InternalError";
  message?: string;
};
