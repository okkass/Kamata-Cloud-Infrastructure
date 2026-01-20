import { ResourceService } from "@/common/service";
import type {
  InstanceTypeCreateRequest,
  InstanceTypeResponse,
  InstanceTypePatchRequest,
  InstanceTypePutRequest,
} from "@app/shared/types";
import { UserPermissions } from "@/types";
import type { ServiceError } from "@/common/errors";
import InstanceTypeRepository from "@/repository/InstanceTypeRepository";

export const getInstanceTypeService = (permission: UserPermissions) => {
  const InstanceTypeService: ResourceService<
    InstanceTypeResponse,
    InstanceTypeCreateRequest,
    InstanceTypePatchRequest | InstanceTypePutRequest,
    ServiceError
  > = {
    permission,

    async list(query) {
      const instanceTypes = await InstanceTypeRepository.list();
      return { success: true, data: instanceTypes };
    },

    async getById(id) {
      const instanceType = await InstanceTypeRepository.getById(id);
      if (!instanceType) {
        return {
          success: false,
          error: "NotFound" as unknown as ServiceError,
        };
      }
      return { success: true, data: instanceType };
    },

    async create(data) {
      const newInstanceType = await InstanceTypeRepository.create(data);
      if (!newInstanceType) {
        return {
          success: false,
          error: "BadRequest" as unknown as ServiceError,
        };
      }
      return { success: true, data: newInstanceType };
    },

    async update(id, data) {
      const updatedInstanceType = await InstanceTypeRepository.update(id, data);
      if (!updatedInstanceType) {
        return {
          success: false,
          error: "NotFound" as unknown as ServiceError,
        };
      }
      return { success: true, data: updatedInstanceType };
    },

    async delete(id) {
      const deleted = await InstanceTypeRepository.deleteById(id);
      if (!deleted) {
        return {
          success: false,
          error: "NotFound" as unknown as ServiceError,
        };
      }
      return { success: true, data: null };
    },
  };

  return InstanceTypeService;
};
