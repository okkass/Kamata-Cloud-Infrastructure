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
import type {
  InstanceTypeRecord,
  InstanceTypeInsertProps,
  InstanceTypeUpdateProps,
} from "@/repository/InstanceTypeRepository";

const toResponse = (record: InstanceTypeRecord): InstanceTypeResponse => {
  return {
    id: record.uuid,
    name: record.name,
    cpuCore: record.cpuCore,
    memorySize: record.memorySizeBytes,
    createdAt: record.createdAt,
  };
};

const toInsertProps = (
  data: InstanceTypeCreateRequest,
): InstanceTypeInsertProps => {
  return {
    name: data.name,
    cpuCore: data.cpuCore,
    memorySizeBytes: data.memorySize,
  };
};

const toUpdateProps = (
  data: InstanceTypePatchRequest | InstanceTypePutRequest,
): InstanceTypeUpdateProps => {
  return {
    name: data.name,
    cpuCore: data.cpuCore,
    memorySizeBytes: data.memorySize,
  };
};

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
      if (!instanceTypes.success) {
        return {
          success: false,
          error: { reason: "InternalError" },
        };
      }
      return { success: true, data: instanceTypes.data.map(toResponse) };
    },

    async getById(id) {
      const instanceType = await InstanceTypeRepository.getById(id);
      if (!instanceType.success) {
        return {
          success: false,
          error: { reason: "InternalError" },
        };
      }
      if (!instanceType.data) {
        return {
          success: false,
          error: { reason: "NotFound" },
        };
      }
      return { success: true, data: toResponse(instanceType.data) };
    },

    async create(data) {
      const newInstanceType = await InstanceTypeRepository.create(
        toInsertProps(data),
      );
      if (!newInstanceType.success) {
        return {
          success: false,
          error: { reason: "InternalError" },
        };
      }
      return { success: true, data: toResponse(newInstanceType.data) };
    },

    async update(id, data) {
      const updatedInstanceType = await InstanceTypeRepository.update(
        id,
        toUpdateProps(data),
      );
      if (!updatedInstanceType.success) {
        if (updatedInstanceType.error.reason === "NotFound") {
          return {
            success: false,
            error: { reason: "NotFound" },
          };
        }
        return {
          success: false,
          error: { reason: "InternalError" },
        };
      }
      return { success: true, data: toResponse(updatedInstanceType.data) };
    },

    async delete(id) {
      const deleted = await InstanceTypeRepository.deleteById(id);
      if (!deleted.success) {
        if (deleted.error.reason === "NotFound") {
          return {
            success: false,
            error: { reason: "NotFound" },
          };
        }
        return {
          success: false,
          error: { reason: "InternalError" },
        };
      }
      return { success: true, data: undefined };
    },
  };

  return InstanceTypeService;
};
