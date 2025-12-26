import type { ResourceService } from "@/common/service";
import type { Result } from "@/common/type";
import type { SuccessDetail } from "@/common/SuccessDetail";
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

type VirtualMachinePowerService = {
  vmid: string;
  start: () => Result<SuccessDetail, ServiceError>;
  shutdown: () => Result<SuccessDetail, ServiceError>;
  stop: () => Result<SuccessDetail, ServiceError>;
  reboot: () => Result<SuccessDetail, ServiceError>;
  reset: () => Result<SuccessDetail, ServiceError>;
};

type VirtualMachineService = ResourceService<
  VirtualMachineResponse,
  VirtualMachineCreateRequest,
  VirtualMachinePatchRequest | VirtualMachinePutRequest,
  ServiceError
> & {
  getStorageService: (
    vmId: string
  ) =>
    | ResourceService<
        StorageResponse,
        StorageCreateRequest,
        StoragePatchRequest | StoragePutRequest,
        ServiceError
      >
    | undefined;
  getNetworkInterfaceService: (
    vmId: string
  ) =>
    | ResourceService<
        NetworkInterfaceResponse,
        NetworkInterfaceCreateRequest,
        NetworkInterfacePatchRequest | NetworkInterfacePutRequest,
        ServiceError
      >
    | undefined;
  getVmSecurityGroupService: (
    vmId: string
  ) =>
    | ResourceService<
        SecurityGroupResponse,
        VmSecurityGroupAddRequest,
        never,
        ServiceError
      >
    | undefined;
  getPowerService: (vmId: string) => VirtualMachinePowerService;
};

export const getVirtualMachineService = (permission: UserPermissions) => {
  const virtualMachineService: VirtualMachineService = {
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
        console.log("VM not found for update:", id);
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
    getStorageService(vmId) {
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
          const storage = VirtualMachineRepository.createStorage(vmId, data);
          if (!storage) {
            return {
              success: false,
              error: "BadRequest",
            };
          }
          return { success: true, data: storage };
        },
        update(id, data) {
          const updatedStorage = VirtualMachineRepository.updateStorage(
            vmId,
            id,
            data
          );
          if (!updatedStorage) {
            return {
              success: false,
              error: "NotFound",
            };
          }
          return { success: true, data: updatedStorage };
        },
        delete(id) {
          const deleted = VirtualMachineRepository.deleteStorage(vmId, id);
          if (!deleted) {
            return {
              success: false,
              error: "NotFound",
            };
          }
          return { success: true, data: null };
        },
      };
      return StorageService;
    },
    getNetworkInterfaceService(vmId) {
      const NetworkInterfaceService: ResourceService<
        NetworkInterfaceResponse,
        NetworkInterfaceCreateRequest,
        NetworkInterfacePatchRequest | NetworkInterfacePutRequest,
        ServiceError
      > = {
        permission,
        list(query) {
          const nics =
            VirtualMachineRepository.listNetworkInterfacesByVirtualMachineId(
              vmId
            );
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
          const nic = VirtualMachineRepository.createNetworkInterface(
            vmId,
            data
          );
          if (!nic) {
            return {
              success: false,
              error: "BadRequest",
            };
          }
          return { success: true, data: nic };
        },
        update(id, data) {
          const updatedNic = VirtualMachineRepository.updateNetworkInterface(
            vmId,
            id,
            data
          );
          if (!updatedNic) {
            return {
              success: false,
              error: "NotFound",
            };
          }
          return { success: true, data: updatedNic };
        },
        delete(id) {
          const deleted = VirtualMachineRepository.deleteNetworkInterface(
            vmId,
            id
          );
          if (!deleted) {
            return {
              success: false,
              error: "NotFound",
            };
          }
          return { success: true, data: null };
        },
      };
      return NetworkInterfaceService;
    },
    getVmSecurityGroupService(vmId) {
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
          const added = VirtualMachineRepository.addSecurityGroupToVm(
            vmId,
            data
          );
          if (!added) {
            return { success: false, error: "BadRequest" };
          }
          return { success: true, data: added };
        },
        update(id, data) {
          // セキュリティグループに聞いて
          return { success: false, error: "BadRequest" };
        },
        delete(id) {
          // 仮想マシンからセキュリティグループを削除
          const deleted = VirtualMachineRepository.deleteSecurityGroupFromVm(
            vmId,
            id
          );
          if (!deleted) {
            return { success: false, error: "NotFound" };
          }
          return { success: true, data: null };
        },
      };
      return VmSecurityGroupService;
    },
    getPowerService(vmId) {
      const powerService: VirtualMachinePowerService = {
        vmid: vmId,
        start() {
          return { success: true, data: "Accepted" };
        },
        shutdown() {
          return { success: true, data: "Accepted" };
        },
        stop() {
          return { success: true, data: "Accepted" };
        },
        reboot() {
          return { success: true, data: "Accepted" };
        },
        reset() {
          return { success: true, data: "Accepted" };
        },
      };
      return powerService;
    },
  };
  return virtualMachineService;
};
