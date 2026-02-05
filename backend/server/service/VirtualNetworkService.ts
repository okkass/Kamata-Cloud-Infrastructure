import type { ResourceService } from "@/common/service";
import type {
  VirtualNetworkResponse,
  VirtualNetworkCreateRequest,
  VirtualNetworkPatchRequest,
  VirtualNetworkPutRequest,
  SubnetResponse,
  SubnetCreateRequest,
  SubnetPatchRequest,
  SubnetPutRequest,
} from "@app/shared/types";
import { UserPermissions } from "@/types";
import type { ServiceError } from "@/common/errors";
import VirtualNetworkRepository from "@/repository/VirtualNetworkRepository";
import type {
  VirtualNetworkInsertProps,
  VirtualNetworkUpdateProps,
  VirtualNetworkRecord,
  SubnetInsertProps,
  SubnetUpdateProps,
  SubnetRecord,
} from "@/repository/VirtualNetworkRepository";

type SubnetService = ResourceService<
  SubnetResponse,
  SubnetCreateRequest,
  SubnetPatchRequest | SubnetPutRequest,
  ServiceError
>;

type VirtualNetworkService = ResourceService<
  VirtualNetworkResponse,
  VirtualNetworkCreateRequest,
  VirtualNetworkPatchRequest | VirtualNetworkPutRequest,
  ServiceError
> & {
  getSubnetService: (vnetId: string) => SubnetService;
};

const toSubnetResponse = (
  record: SubnetRecord,
  parent?: VirtualNetworkRecord,
): SubnetResponse => {
  return {
    id: record.id,
    name: record.name,
    cidr: record.cidr.address + "/" + record.cidr.prefixLength,
    createdAt: record.createdAt.toISOString(),
    parent: parent
      ? {
          id: parent.id,
          name: parent.name,
          cidr: parent.cidr.address + "/" + parent.cidr.prefixLength,
          createdAt: parent.createdAt.toISOString(),
        }
      : undefined,
  };
};

const toNetworkResponse = (
  record: VirtualNetworkRecord,
): VirtualNetworkResponse => {
  return {
    id: record.id,
    name: record.name,
    cidr: record.cidr.address + "/" + record.cidr.prefixLength,
    createdAt: record.createdAt.toISOString(),
    owner: record.owner,
    subnets: record.subnets.map((subnet) => toSubnetResponse(subnet, record)),
  };
};

const toSubnetInsertProps = (data: SubnetCreateRequest): SubnetInsertProps => {
  return {
    name: data.name,
    cidr: data.cidr,
  };
};

const toNetworkInsertProps = (
  userId: string,
  data: VirtualNetworkCreateRequest,
): VirtualNetworkInsertProps => {
  return {
    name: data.name,
    cidr: data.cidr,
    userId: userId,
    initialSubnets: data.initialSubnets.map(toSubnetInsertProps) || [],
  };
};

export const getVirtualNetworkService = (permission: UserPermissions) => {
  const VirtualNetworkService: VirtualNetworkService = {
    list: async (query) => {
      const result = await VirtualNetworkRepository.list(query);
      if (!result.success) {
        return {
          success: false,
          error: {
            reason: "InternalError",
          },
        };
      }
      return {
        success: true,
        data: result.data.map(toNetworkResponse),
      };
    },
    getById: async (id) => {
      const result = await VirtualNetworkRepository.getById(id);
      if (!result.success) {
        return {
          success: false,
          error: {
            reason:
              result.error.reason === "NotFound" ? "NotFound" : "InternalError",
            message: result.error.message,
          },
        };
      }
      if (!result.data) {
        return {
          success: false,
          error: {
            reason: "NotFound",
          },
        };
      }
      return {
        success: true,
        data: toNetworkResponse(result.data),
      };
    },
    create: async (data) => {
      // 親をCIDRの妥当性チェック
      const parentInet = parseCidr(data.cidr);
      if (!parentInet) {
        return {
          success: false,
          error: {
            reason: "BadRequest",
            message: "Invalid CIDR format",
          },
        };
      }
      // サブネットのCIDR妥当性チェック
      const subnetInets: Array<Inet4> = [];
      for (const subnet of data.initialSubnets || []) {
        const subnetInet = parseCidr(subnet.cidr);
        if (!subnetInet) {
          return {
            success: false,
            error: {
              reason: "BadRequest",
              message: `Invalid CIDR format in subnet ${subnet.name}`,
            },
          };
        }
        // サブネットが親に含まれているかチェック
        if (!isCidrInCidr(subnetInet, parentInet)) {
          return {
            success: false,
            error: {
              reason: "BadRequest",
              message: `Subnet ${subnet.name} CIDR is not within parent CIDR`,
            },
          };
        }
        subnetInets.push(subnetInet);
      }
      // サブネット同士の重複チェック
      if (hasOverlappingCidrs(subnetInets)) {
        return {
          success: false,
          error: {
            reason: "BadRequest",
            message: "Overlapping CIDRs found among subnets",
          },
        };
      }

      const newVnet = await VirtualNetworkRepository.create(
        toNetworkInsertProps(permission.id, data),
      );
      if (!newVnet.success) {
        return {
          success: false,
          error: {
            reason: "InternalError",
            message: newVnet.error.message,
          },
        };
      }
      return { success: true, data: toNetworkResponse(newVnet.data) };
    },
    update: async (id, data) => {
      const result = await VirtualNetworkRepository.update(
        id,
        data as VirtualNetworkUpdateProps,
      );
      if (!result.success) {
        return {
          success: false,
          error: {
            reason:
              result.error.reason === "NotFound" ? "NotFound" : "InternalError",
            message: result.error.message,
          },
        };
      }
      return { success: true, data: toNetworkResponse(result.data) };
    },
    delete: async (id) => {
      const result = await VirtualNetworkRepository.deleteById(id);
      if (!result.success) {
        return {
          success: false,
          error: {
            reason:
              result.error.reason === "NotFound" ? "NotFound" : "InternalError",
            message: result.error.message,
          },
        };
      }
      return { success: true, data: undefined };
    },
    getSubnetService(vnetId) {
      const SubnetService: SubnetService = {
        list: async (query) => {
          const result = await VirtualNetworkRepository.listSubnets(vnetId);
          if (!result.success) {
            return {
              success: false,
              error: {
                reason:
                  result.error.reason === "NotFound"
                    ? "NotFound"
                    : "InternalError",
                message: result.error.message,
              },
            };
          }
          const parent = await VirtualNetworkRepository.getById(vnetId);
          if (!parent.success || !parent.data) {
            return {
              success: false,
              error: {
                reason: "InternalError",
                message: "Failed to retrieve parent virtual network",
              },
            };
          }
          return {
            success: true,
            data: result.data.map((subnet) =>
              toSubnetResponse(subnet, parent.data!),
            ),
          };
        },
        getById: async (id) => {
          const result = await VirtualNetworkRepository.getSubnet(vnetId, id);
          if (!result.success) {
            return {
              success: false,
              error: {
                reason:
                  result.error.reason === "NotFound"
                    ? "NotFound"
                    : "InternalError",
                message: result.error.message,
              },
            };
          }
          if (!result.data) {
            return {
              success: false,
              error: {
                reason: "NotFound",
              },
            };
          }
          const parent = await VirtualNetworkRepository.getById(vnetId);
          if (!parent.success || !parent.data) {
            return {
              success: false,
              error: {
                reason: "InternalError",
                message: "Failed to retrieve parent virtual network",
              },
            };
          }
          return {
            success: true,
            data: toSubnetResponse(result.data, parent.data),
          };
        },
        create: async (data) => {
          // CIDR妥当性チェック
          const subnetInet = parseCidr(data.cidr);
          if (!subnetInet) {
            return {
              success: false,
              error: {
                reason: "BadRequest",
                message: "Invalid CIDR format",
              },
            };
          }
          // 親のCIDR取得
          const parentResult = await VirtualNetworkRepository.getById(vnetId);
          if (!parentResult.success || !parentResult.data) {
            return {
              success: false,
              error: {
                reason: "InternalError",
                message: "Failed to retrieve parent virtual network",
              },
            };
          }
          // 親の範囲に含まれているかチェック
          if (!isCidrInCidr(subnetInet, parentResult.data.cidr)) {
            return {
              success: false,
              error: {
                reason: "BadRequest",
                message: "Subnet CIDR is not within parent CIDR",
              },
            };
          }
          // 既存サブネットとの重複チェック
          const subnets = parentResult.data.subnets.map((s) => s.cidr);
          subnets.push(subnetInet);
          if (hasOverlappingCidrs(subnets)) {
            return {
              success: false,
              error: {
                reason: "BadRequest",
                message: "Overlapping CIDRs found among subnets",
              },
            };
          }

          const newSubnet = await VirtualNetworkRepository.createSubnet(
            vnetId,
            toSubnetInsertProps(data),
          );
          if (!newSubnet.success) {
            return {
              success: false,
              error: {
                reason: "InternalError",
                message: "Failed to create subnet",
              },
            };
          }
          return {
            success: true,
            data: toSubnetResponse(newSubnet.data, parentResult.data),
          };
        },
        update(id, data) {
          const updatedSubnet = VirtualNetworkRepository.updateSubnet(
            vnetId,
            id,
            data,
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
    },
  };
  return VirtualNetworkService;
};
