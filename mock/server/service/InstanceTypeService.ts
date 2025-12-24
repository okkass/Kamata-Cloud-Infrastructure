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
    list(query) {
      const instanceTypes = InstanceTypeRepository.list();
      return { success: true, data: instanceTypes };
    },
    getById(id) {
      const instanceType = InstanceTypeRepository.getById(id);
      if (!instanceType) {
        return {
          success: false,
          error: "NotFound",
        };
      }
      return { success: true, data: instanceType };
    },
    create(data) {
      const newInstanceType = InstanceTypeRepository.create(data);
      if (!newInstanceType) {
        return {
          success: false,
          error: "BadRequest",
        };
      }
      return { success: true, data: newInstanceType };
    },
    update(id, data) {
      const updatedInstanceType = InstanceTypeRepository.update(id, data);
      if (!updatedInstanceType) {
        return {
          success: false,
          error: "NotFound",
        };
      }
      return { success: true, data: updatedInstanceType };
    },
    delete(id) {
      const deleted = InstanceTypeRepository.deleteById(id);
      if (!deleted) {
        return { success: false, error: "NotFound" };
      }
      return { success: true, data: null };
    },
  };
  return InstanceTypeService;
};
