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
    list: async (
      query?: string,
    ): Promise<Result<MiddlewareResponse[], ServiceError>> => {
      const result = await MiddlewareRepository.list();
      if (!result.success) {
        return {
          success: false,
          error: {
            reason: "InternalError",
            message: result.error.message,
          },
        };
      }
      return {
        success: true,
        data: result.data,
      };
    },
    getById: async (id: string) => {
      return {
        success: false,
        error: {
          reason: "BadRequest",
        },
      };
    },
    create: async (data) => {
      return {
        success: false,
        error: {
          reason: "BadRequest",
        },
      };
    },
    update: async (id, data) => {
      return {
        success: false,
        error: {
          reason: "BadRequest",
        },
      };
    },
    delete: async (id) => {
      return {
        success: false,
        error: {
          reason: "BadRequest",
        },
      };
    },
  };
  return MiddlewareService;
};
