import type { ResourceService } from "@@/server/common/service/ResourceService";
import type {
  StoragePoolResponse,
  StoragePoolCreateRequest,
  StoragePoolPutRequest,
  StoragePoolPatchRequest,
} from "@@/shared/types";
import { UserPermissions } from "@@/server/types";
import type { ServiceError } from "@@/server/common/errors";
import StoragePoolRepository from "@@/server/repository/StoragePoolRepository";

export const getStoragePoolService = (permission: UserPermissions) => {
  const StoragePoolService: ResourceService<
    StoragePoolResponse,
    StoragePoolCreateRequest,
    StoragePoolPatchRequest | StoragePoolPutRequest,
    ServiceError
  > = {
    permission,
    list(query) {
      const pools = StoragePoolRepository.list();
      return { success: true, data: pools };
    },
    getById(id) {
      const pool = StoragePoolRepository.getById(id);
      if (!pool) {
        return {
          success: false,
          error: "NotFound",
        };
      }
      return { success: true, data: pool };
    },
    create(data) {
      const newPool = StoragePoolRepository.add(data);
      if (!newPool) {
        return {
          success: false,
          error: "BadRequest",
        };
      }
      return { success: true, data: newPool };
    },
    update(id, data) {
      const updatedPool = StoragePoolRepository.update(id, data);
      if (!updatedPool) {
        return {
          success: false,
          error: "NotFound",
        };
      }
      return { success: true, data: updatedPool };
    },
    delete(id) {
      const deleted = StoragePoolRepository.deleteById(id);
      if (!deleted) {
        return { success: false, error: "NotFound" };
      }
      return { success: true, data: null };
    },
  };
  return StoragePoolService;
};
