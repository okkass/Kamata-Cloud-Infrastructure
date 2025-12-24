import type { ResourceService } from "@/common/service";
import type { MiddlewareResponse } from "@app/shared/types";
import { UserPermissions } from "@/types";
import type { ServiceError } from "@/common/errors";
import MiddlewareRepository from "@/repository/MiddlewareRepository";
import type { Result } from "@/common/type";

export const getMiddlewareService = (permission: UserPermissions) => {
  const MiddlewareService: ResourceService<
    MiddlewareResponse,
    never,
    never,
    ServiceError
  > = {
    permission,
    list(query?: string): Result<MiddlewareResponse[], ServiceError> {
      const middlewares = MiddlewareRepository.list();
      return { success: true, data: middlewares };
    },
    getById(id): Result<MiddlewareResponse, ServiceError> {
      // MiddlewareRepository does not have getById method in the current implementation
      return {
        success: false,
        error: "NotFound",
      };
    },
    create(data) {
      return {
        success: false,
        error: "BadRequest",
      };
    },
    update(id, data) {
      return {
        success: false,
        error: "NotFound",
      };
    },
    delete(id) {
      return {
        success: false,
        error: "NotFound",
      };
    },
  };
  return MiddlewareService;
};
