import type { ResourceService } from "@/common/service";
import type {
  VirtualMachineResponse,
  VirtualMachineCreateRequest,
  VirtualMachinePatchRequest,
  VirtualMachinePutRequest,
  StorageCreateRequest,
  StorageResponse,
  StoragePatchRequest,
} from "@app/shared/types";
import { UserPermissions } from "@/types";
import type { ServiceError } from "@/common/errors";
import VirtualMachineRepository from "@/repository/VirtualMachineRepository";

export const getVirtualMachineService = (permission: UserPermissions) => {
  const VirtualMachineService: ResourceService<
    VirtualMachineResponse,
    VirtualMachineCreateRequest,
    VirtualMachinePatchRequest | VirtualMachinePutRequest,
    ServiceError
  > = {
    permission,
    list(query) {
      const vms = VirtualMachineRepository.list();
      return { success: true, data: vms };
    },
    getById(id) {
      const vm = VirtualMachineRepository.getById(id);
      if (!vm) {
        return {
          success: false,
          error: "NotFound",
        };
      }
      return { success: true, data: vm };
    },
    create(data) {
      const newVm = VirtualMachineRepository.create(data);
      if (!newVm) {
        return {
          success: false,
          error: "BadRequest",
        };
      }
      return { success: true, data: newVm };
    },
    update(id, data) {
      const updatedVm = VirtualMachineRepository.update(id, data);
      if (!updatedVm) {
        return {
          success: false,
          error: "NotFound",
        };
      }
      return { success: true, data: updatedVm };
    },
    delete(id) {
      const deleted = VirtualMachineRepository.deleteById(id);
      if (!deleted) {
        return {
          success: false,
          error: "NotFound",
        };
      }
      return { success: true, data: null };
    },
  };
  return VirtualMachineService;
};

const getStorageService = (permission: UserPermissions, vmId: string) => {};
