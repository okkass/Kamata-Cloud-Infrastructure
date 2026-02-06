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
  const ip = parseCidr4(data.cidr);
  return {
    name: data.name,
    cidr: ip.network + "/" + ip.prefixLength,
  };
};

const toNetworkInsertProps = (
  userId: string,
  data: VirtualNetworkCreateRequest,
): VirtualNetworkInsertProps => {
  const ip = parseCidr4(data.cidr);
  return {
    name: data.name,
    cidr: ip.network + "/" + ip.prefixLength,
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
      // 親をIPv4にパース すでにzodでバリデしてるので、エラーはないはず
      const parentInet = parseCidr4(data.cidr);
      // サブネットをIPv4にパース＆親に含まれているかチェック
      const subnetInets: Array<Inet4> = [];
      for (const subnet of data.initialSubnets || []) {
        const subnetInet = parseCidr4(subnet.cidr);
        // サブネットが親に含まれているかチェック
        if (isCidrInCidr(subnetInet, parentInet)) {
          subnetInets.push(subnetInet);
        } else {
          return {
            success: false,
            error: {
              reason: "BadRequest",
              message: `Subnet CIDR ${subnet.cidr} is not within parent CIDR`,
            },
          };
        }
      }
      // サブネット同士の重複チェック
      for (let i = 0; i < subnetInets.length; i++) {
        for (let j = i + 1; j < subnetInets.length; j++) {
          if (i === j) {
            continue;
          }
          if (hasOverlappingCidrs(subnetInets[i], subnetInets[j])) {
            return {
              success: false,
              error: {
                reason: "BadRequest",
                message: `Overlapping CIDRs found among subnets: ${data.initialSubnets?.[i].cidr} and ${data.initialSubnets?.[j].cidr}`,
              },
            };
          }
        }
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
          const subnetInet = parseCidr4(data.cidr);
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
          for (let i = 0; i < subnets.length; i++) {
            for (let j = i + 1; j < subnets.length; j++) {
              if (i === j) {
                continue;
              }
              if (hasOverlappingCidrs(subnets[i], subnets[j])) {
                return {
                  success: false,
                  error: {
                    reason: "BadRequest",
                    message: "Overlapping CIDRs found among subnets",
                  },
                };
              }
            }
          }

          // サブネット作成
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
        update: async (id, data) => {
          // まず親たる仮想ネットワークを取得
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
          const parent = parentResult.data;

          // CIDRを更新したいときだけチェック
          if (data.cidr) {
            const subnetInet = parseCidr4(data.cidr);
            // 親の範囲に含まれているかチェック
            if (!isCidrInCidr(subnetInet, parent.cidr)) {
              return {
                success: false,
                error: {
                  reason: "BadRequest",
                  message: "Subnet CIDR is not within parent CIDR",
                },
              };
            }
            // 既存サブネットとの重複チェック
            const subnets = parent.subnets
              .filter((s) => s.id !== id)
              .map((s) => s.cidr);
            subnets.push(subnetInet);
            for (let i = 0; i < subnets.length; i++) {
              for (let j = i + 1; j < subnets.length; j++) {
                if (i === j) {
                  continue;
                }
                if (hasOverlappingCidrs(subnets[i], subnets[j])) {
                  return {
                    success: false,
                    error: {
                      reason: "BadRequest",
                      message: "Overlapping CIDRs found among subnets",
                    },
                  };
                }
              }
            }
          }
          // ここに来ればCIDRは問題ないので更新実行
          let cidr = undefined;
          if (data.cidr) {
            const parsed = parseCidr4(data.cidr);
            cidr = parsed.network + "/" + parsed.prefixLength;
          }
          const result = await VirtualNetworkRepository.updateSubnet(
            vnetId,
            id,
            {
              name: data.name,
              cidr: cidr,
            },
          );
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
          return {
            success: true,
            data: toSubnetResponse(result.data, parent),
          };
        },
        delete: async (id) => {
          const result = await VirtualNetworkRepository.deleteSubnet(
            vnetId,
            id,
          );
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
          return { success: true, data: undefined };
        },
      };
      return SubnetService;
    },
  };
  return VirtualNetworkService;
};
