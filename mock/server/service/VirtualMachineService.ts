import type { ResourceService } from "@/common/service";
import type {
  VirtualMachineResponse,
  VirtualMachineCreateRequest,
  VirtualMachinePatchRequest,
  VirtualMachinePutRequest,
  StorageCreateRequest,
  StorageResponse,
  StoragePatchRequest,
  StoragePutRequest,
  NetworkInterfaceResponse,
  NetworkInterfaceCreateRequest,
  NetworkInterfacePatchRequest,
  NetworkInterfacePutRequest,
  SecurityGroupResponse,
} from "@app/shared/types";
import { UserPermissions, VmSecurityGroupAddRequest } from "@/types";
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

export const getStorageService = (
  permission: UserPermissions,
  vmId: string
) => {
  const StorageService: ResourceService<
    StorageResponse,
    StorageCreateRequest,
    StoragePatchRequest | StoragePutRequest,
    ServiceError
  > = {
    permission,
    list(query) {
      const storages =
        VirtualMachineRepository.listStoragesByVirtualMachineId(vmId) || [];
      return { success: true, data: storages };
    },
    getById(id) {
      const storage = VirtualMachineRepository.getStorage(vmId, id);
      if (!storage) {
        return {
          success: false,
          error: "NotFound",
        };
      }
      return { success: true, data: storage };
    },
    create(data) {
      return {
        success: false,
        error: "NotImplemented",
      };
    },
    update(id, data) {
      return {
        success: false,
        error: "NotImplemented",
      };
    },
    delete(id) {
      return {
        success: false,
        error: "NotImplemented",
      };
    },
  };
  return StorageService;
};

export const getNetworkInterfaceService = (
  permission: UserPermissions,
  vmId: string
) => {
  const NetworkInterfaceService: ResourceService<
    NetworkInterfaceResponse,
    NetworkInterfaceCreateRequest,
    NetworkInterfacePatchRequest | NetworkInterfacePutRequest,
    ServiceError
  > = {
    permission,
    list(query) {
      const nics =
        VirtualMachineRepository.listNetworkInterfacesByVirtualMachineId(vmId);
      if (!nics) {
        return {
          success: false,
          error: "NotFound",
        };
      }
      return { success: true, data: nics };
    },
    getById(id) {
      const nic = VirtualMachineRepository.getNetworkInterface(vmId, id);
      if (!nic) {
        return {
          success: false,
          error: "NotFound",
        };
      }
      return { success: true, data: nic };
    },
    create(data) {
      return {
        success: false,
        error: "NotImplemented",
      };
    },
    update(id, data) {
      return {
        success: false,
        error: "NotImplemented",
      };
    },
    delete(id) {
      return {
        success: false,
        error: "NotImplemented",
      };
    },
  };
  return NetworkInterfaceService;
};

export const getVmSecurityGroupService = (
  permission: UserPermissions,
  vmId: string
) => {
  const VmSecurityGroupService: ResourceService<
    SecurityGroupResponse,
    VmSecurityGroupAddRequest,
    never,
    ServiceError
  > = {
    permission,
    list(query) {
      const securityGroups =
        VirtualMachineRepository.listSecurityGroupsByVirtualMachineId(vmId);
      if (!securityGroups) {
        return {
          success: false,
          error: "NotFound",
        };
      }
      return { success: true, data: securityGroups };
    },
    getById(id) {
      // ID知ってるならセキュリティグループに聞いて
      return { success: false, error: "BadRequest" };
    },
    create(data) {
      // 仮想マシンにセキュリティグループを追加
      return { success: false, error: "NotImplemented" };
    },
    update(id, data) {
      // セキュリティグループに聞いて
      return { success: false, error: "BadRequest" };
    },
    delete(id) {
      // 仮想マシンからセキュリティグループを削除
      return { success: false, error: "NotImplemented" };
    },
  };
  return VmSecurityGroupService;
};
