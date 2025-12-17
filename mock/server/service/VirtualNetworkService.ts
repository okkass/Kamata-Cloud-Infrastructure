import type { ResourceService } from "@/common/service";
import type {
  VirtualNetworkResponse,
  VirtualNetworkCreateRequest,
  VirtualMachinePatchRequest,
  VirtualMachinePutRequest,
  SubnetResponse,
  SubnetCreateRequest,
  SubnetPatchRequest,
  SubnetPutRequest,
} from "@app/shared/types";
import { UserPermissions } from "@/types";
import type { ServiceError } from "@/common/errors";
import VirtualNetworkRepository from "@/repository/VirtualNetworkRepository";

export const getVirtualNetworkService = (permission: UserPermissions) => {
  const VirtualNetworkService: ResourceService<
    VirtualNetworkResponse,
    VirtualNetworkCreateRequest,
    VirtualMachinePatchRequest | VirtualMachinePutRequest,
    ServiceError
  > = {
    permission,
    list(query?: string) {
      const vnets = VirtualNetworkRepository.list();
      return { success: true, data: vnets };
    },
    getById(id) {
      const vnet = VirtualNetworkRepository.getById(id);
      if (!vnet) {
        return {
          success: false,
          error: "NotFound",
        };
      }
      return { success: true, data: vnet };
    },
    create(data) {
      const newVnet = VirtualNetworkRepository.create(data);
      if (!newVnet) {
        return {
          success: false,
          error: "BadRequest",
        };
      }
      return { success: true, data: newVnet };
    },
    update(id, data) {
      const updatedVnet = VirtualNetworkRepository.update(id, data);
      if (!updatedVnet) {
        return {
          success: false,
          error: "NotFound",
        };
      }
      return { success: true, data: updatedVnet };
    },
    delete(id) {
      const deleted = VirtualNetworkRepository.deleteById(id);
      if (!deleted) {
        return {
          success: false,
          error: "NotFound",
        };
      }
      return { success: true, data: null };
    },
  };
  return VirtualNetworkService;
};

export const getSubnetService = (
  permission: UserPermissions,
  vnetId: string
) => {
  const SubnetService: ResourceService<
    SubnetResponse,
    SubnetCreateRequest,
    SubnetPatchRequest | SubnetPutRequest,
    ServiceError
  > = {
    permission,
    list(query) {
      const subnets = VirtualNetworkRepository.listSubnets(vnetId);
      if (!subnets) {
        return {
          success: false,
          error: "NotFound",
        };
      }
      return { success: true, data: subnets };
    },
    getById(id) {
      const subnet = VirtualNetworkRepository.getSubnet(vnetId, id);
      if (!subnet) {
        return {
          success: false,
          error: "NotFound",
        };
      }
      return { success: true, data: subnet };
    },
    create(data) {
      const newSubnet = VirtualNetworkRepository.createSubnet(vnetId, data);
      if (!newSubnet) {
        return {
          success: false,
          error: "BadRequest",
        };
      }
      return { success: true, data: newSubnet };
    },
    update(id, data) {
      const updatedSubnet = VirtualNetworkRepository.updateSubnet(
        vnetId,
        id,
        data
      );
      if (!updatedSubnet) {
        return {
          success: false,
          error: "NotFound",
        };
      }
      return { success: true, data: updatedSubnet };
    },
    delete(id) {
      const deleted = VirtualNetworkRepository.deleteSubnet(vnetId, id);
      if (!deleted) {
        return {
          success: false,
          error: "NotFound",
        };
      }
      return { success: true, data: null };
    },
  };
  return SubnetService;
};
