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
  NodeResponse,
  StoragePoolResponse,
  SubnetResponse,
  VirtualNetworkResponse,
} from "@app/shared/types";
import { UserPermissions, VmSecurityGroupAddRequest } from "@/types";
import type { ServiceError } from "@/common/errors";
import { getInstanceTypeService } from "./InstanceTypeService";
import VirtualMachineRepository from "@/repository/VirtualMachineRepository";
import {
  VirtualMachineRecord,
  StorageRecord,
  NetworkInterfaceRecord,
  VirtualMachineInsertProps,
  VirtualMachineUpdateProps,
} from "@/repository/VirtualMachineRepository";
import { getNodeService } from "./NodeService";
import { getSecurityGroupService } from "./SecurityGroupService";
import { getStoragePoolService } from "./StoragePoolService";
import { getVirtualNetworkService } from "./VirtualNetworkService";

type VirtualMachinePowerService = {
  start: () => Promise<Result<SuccessDetail, ServiceError>>;
  shutdown: () => Promise<Result<SuccessDetail, ServiceError>>;
  stop: () => Promise<Result<SuccessDetail, ServiceError>>;
  reboot: () => Promise<Result<SuccessDetail, ServiceError>>;
  reset: () => Promise<Result<SuccessDetail, ServiceError>>;
};

type VirtualMachineService = ResourceService<
  VirtualMachineResponse,
  VirtualMachineCreateRequest,
  VirtualMachinePatchRequest | VirtualMachinePutRequest,
  ServiceError
> & {
  getStorageService: (
    vmId: string,
  ) =>
    | ResourceService<
        StorageResponse,
        StorageCreateRequest,
        StoragePatchRequest | StoragePutRequest,
        ServiceError
      >
    | undefined;
  getNetworkInterfaceService: (
    vmId: string,
  ) =>
    | ResourceService<
        NetworkInterfaceResponse,
        NetworkInterfaceCreateRequest,
        NetworkInterfacePatchRequest | NetworkInterfacePutRequest,
        ServiceError
      >
    | undefined;
  getVmSecurityGroupService: (
    vmId: string,
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

const toStorageResponse = (
  record: StorageRecord,
  pool: StoragePoolResponse,
): StorageResponse => {
  return {
    id: record.id,
    name: record.name,
    size: record.sizeBytes,
    pool: pool,
    createdAt: record.createdAt.toISOString(),
    devicePath: record.devicePath,
  };
};

const toNetworkResponse = (
  record: NetworkInterfaceRecord,

  subnet: SubnetResponse,
): NetworkInterfaceResponse => {
  return {
    id: record.id,
    name: record.name,
    macAddress: record.macAddress,
    ipAddress: record.ipAddress,
    subnet: subnet,
  };
};

const toVirtualMachineResponse = (
  record: VirtualMachineRecord,
  node: NodeResponse,
  securityGroups: SecurityGroupResponse[],
  storages: StorageResponse[],
  networkInterfaces: NetworkInterfaceResponse[],
): VirtualMachineResponse => {
  return {
    id: record.id,
    name: record.name,
    status: "running", // 仮の値。実際にはハイパーバイザーから取得する必要がある
    node: node,
    createdAt: record.createdAt.toISOString(),
    owner: {
      id: record.owner.id,
      name: record.owner.name,
    },
    securityGroups: securityGroups,
    storages: storages,
    networkInterfaces: networkInterfaces,
    cpuUtilization: 0, // 仮の値。実際にはハイパーバイザーから取得する必要がある
    memoryUtilization: 0, // 仮の値。実際にはハイパーバイザーから取得する必要がある
    storageUtilization: 0, // 仮の値。実際にはハイパーバイザーから取得する必要がある
    cpuCore: record.cpuCore,
    memorySize: record.memoryBytes,
  };
};

export const getVirtualMachineService = (permission: UserPermissions) => {
  const virtualMachineService: VirtualMachineService = {
    list: async (query) => {
      const res = await VirtualMachineRepository.list();
      // 失敗した場合はエラーを返す
      if (!res.success) {
        return {
          success: false,
          error: {
            reason: "InternalError",
            message: res.error.message,
          },
        };
      }
      const vms = res.data;

      // 関係するリソースを集め、Mapの形で保持する
      const nodeMap: Record<string, NodeResponse> = {};
      const securityGroupMap: Record<string, SecurityGroupResponse> = {};
      const poolMap: Record<string, StoragePoolResponse> = {};
      const subnetMap: Record<string, SubnetResponse> = {};

      // 取得すべきリソースIDを集める
      const nodeIds = new Set<string>();
      const securityGroupIds = new Set<string>();
      const storagePoolIds = new Set<string>();
      const vnetIds = new Set<string>();

      for (const vm of vms) {
        nodeIds.add(vm.nodeId);
        vm.securityGroupIds.forEach((id) => securityGroupIds.add(id));
        vm.storages.forEach((storage) => storagePoolIds.add(storage.poolId));
        vm.networkInterfaces.forEach((nic) => vnetIds.add(nic.vnetId));
      }

      // サービスの取得
      const nodeService = getNodeService();
      const securityGroupService = getSecurityGroupService(permission);
      const storagePoolService = getStoragePoolService(permission);
      const virtualNetworkService = getVirtualNetworkService(permission);

      // ノード情報の取得Promiseを作成
      const nodePromises = Array.from(nodeIds).map((nodeId) =>
        nodeService.getById(nodeId).then((res) => {
          if (res.success && res.data) {
            nodeMap[nodeId] = res.data;
          }
        }),
      );
      // セキュリティグループ情報の取得Promiseを作成
      const securityGroupPromises = Array.from(securityGroupIds).map(
        (groupId) =>
          securityGroupService.getById(groupId).then((res) => {
            if (res.success && res.data) {
              securityGroupMap[groupId] = res.data;
            }
          }),
      );
      // ストレージプール情報の取得Promiseを作成
      const storagePoolPromises = Array.from(storagePoolIds).map((poolId) =>
        storagePoolService.getById(poolId).then((res) => {
          if (res.success && res.data) {
            poolMap[poolId] = res.data;
          }
        }),
      );
      // vnet取得->サブネット情報の取得Promiseを作成
      const subnetPromises = Array.from(vnetIds).map((vnetId) =>
        virtualNetworkService.getById(vnetId).then((res) => {
          if (res.success && res.data) {
            res.data.subnets.forEach((subnet) => {
              subnetMap[subnet.id] = subnet;
            });
          }
        }),
      );

      // 全てのPromiseを実行
      await Promise.all([
        ...nodePromises,
        ...securityGroupPromises,
        ...storagePoolPromises,
        ...subnetPromises,
      ]);

      // 最終的なレスポンスの作成
      const vmResponses = vms.map((vm) => {
        const node = nodeMap[vm.nodeId];
        const securityGroups = vm.securityGroupIds
          .map((id) => securityGroupMap[id])
          .filter(Boolean);
        const storages = vm.storages.map((storage) => {
          const pool = poolMap[storage.poolId];
          return toStorageResponse(storage, pool);
        });
        const networkInterfaces = vm.networkInterfaces.map((nic) => {
          const subnet = subnetMap[nic.vnetId];
          return toNetworkResponse(nic, subnet);
        });
        return toVirtualMachineResponse(
          vm,
          node,
          securityGroups,
          storages,
          networkInterfaces,
        );
      });
      return { success: true, data: vmResponses };
    },
    getById: async (id) => {
      const res = await VirtualMachineRepository.getById(id);
      if (!res.success) {
        return {
          success: false,
          error: {
            reason: "InternalError",
            message: res.error.message,
          },
        };
      }
      if (!res.data) {
        return {
          success: false,
          error: {
            reason: "NotFound",
            message: `VirtualMachine with id ${id} not found`,
          },
        };
      }

      const vm = res.data;

      // サブネットはMapで持っておくとうれしい
      // 他は単に配列、あるいは単体オブジェクトで十分
      const subnetMap: Record<string, SubnetResponse> = {};
      const storagePoolMap: Record<string, StoragePoolResponse> = {};

      // 取得すべきリソースIDを集める
      const storagePoolIds = new Set<string>(); // ストレージが属するプールが重複するケースはある
      const vnetIds = new Set<string>(); // ネットワークインターフェースが属するvnetが重複するケースはある

      vm.storages.forEach((storage) => storagePoolIds.add(storage.poolId));
      vm.networkInterfaces.forEach((nic) => vnetIds.add(nic.vnetId));

      //　関係サービスを取得
      const nodeService = getNodeService();
      const securityGroupService = getSecurityGroupService(permission);
      const storagePoolService = getStoragePoolService(permission);
      const virtualNetworkService = getVirtualNetworkService(permission);

      // 関係リソースの取得Promiseを作成
      const nodePromise = nodeService.getById(vm.nodeId);
      const securityGroupPromises = vm.securityGroupIds.map((sgId) =>
        securityGroupService.getById(sgId),
      );
      const storagePoolPromises = vm.storages.map((storage) =>
        storagePoolService.getById(storage.poolId),
      );
      const subnetPromises = vm.networkInterfaces.map((nic) =>
        virtualNetworkService.getById(nic.vnetId).then((res) => {
          if (res.success && res.data) {
            res.data.subnets.forEach((subnet) => {
              subnetMap[subnet.id] = subnet;
            });
          }
          return res;
        }),
      );
      // 全てのPromiseを実行
      const results = await Promise.all([
        nodePromise,
        ...securityGroupPromises,
        ...storagePoolPromises,
        ...subnetPromises,
      ]);
      // 結果をResult<any,any>で受け、successがfalseかだけ見てみる
      for (const res of results) {
        if (!(res as Result<any, any>).success) {
          return {
            success: false,
            error: {
              reason: "InternalError",
            },
          };
        }
      }

      // 成功してるので、分割
      const node: NodeResponse = (results[0] as any).data!;
      const securityGroups: SecurityGroupResponse[] = results
        .slice(1, 1 + vm.securityGroupIds.length)
        .map((res) => (res as any).data!);
      const storagePools: StoragePoolResponse[] = results
        .slice(
          1 + vm.securityGroupIds.length,
          1 + vm.securityGroupIds.length + vm.storages.length,
        )
        .map((res) => (res as any).data!);
      storagePools.forEach((pool) => (storagePoolMap[pool.id] = pool));

      // 最終的なレスポンスの作成
      const storages = vm.storages.map((storage) => {
        const pool = storagePoolMap[storage.poolId];
        return toStorageResponse(storage, pool);
      });
      const networkInterfaces = vm.networkInterfaces.map((nic) => {
        const subnet = subnetMap[nic.vnetId];
        return toNetworkResponse(nic, subnet);
      });
      const vmResponse = toVirtualMachineResponse(
        vm,
        node,
        securityGroups,
        storages,
        networkInterfaces,
      );
      return { success: true, data: vmResponse };
    },
    create: async (data) => {
      // specがinstanceTypeIdを持ってるかスペックを持ってるかで分岐
      let spec;
      if ("instanceTypeId" in data.spec) {
        const instanceTypeService = getInstanceTypeService(permission);
        const res = await instanceTypeService.getById(data.spec.instanceTypeId);
        if (!res.success) {
          return {
            success: false,
            error: {
              reason: "InternalError",
              message: res.error.message,
            },
          };
        }
        if (!res.data) {
          return {
            success: false,
            error: {
              reason: "BadRequest",
              message: `InstanceType with id ${data.spec.instanceTypeId} not found`,
            },
          };
        }
        spec = {
          cpuCore: res.data.cpuCore,
          memoryBytes: res.data.memorySize,
        };
      }
      if ("cpu" in data.spec && "memory" in data.spec) {
        spec = {
          cpuCore: data.spec.cpu,
          memoryBytes: data.spec.memory,
        };
      }
      if (!spec) {
        return {
          success: false,
          error: {
            reason: "BadRequest",
            message: "Invalid spec format",
          },
        };
      }

      // subnetIdsをもとにnicを作る処理が入る

      const insertData: VirtualMachineInsertProps = {
        userId: permission.id,
        nodeId: data.nodeId,
        imageId: data.imageId,
        nics: data.subnetIds.map((subnetId) => {
          return {
            name: `nic-${subnetId}`,
            macAddress: "", // 仮の値。実際にはハイパーバイザーがMACアドレスを生成する必要がある
            ipAddress: "", // 仮の値。実際にはDHCPなどでIPアドレスが割り当てられるため、ここでは空文字を入れておく
            subnetId: subnetId,
          };
        }),
        storages: data.storages.map((storage) => {
          return {
            name: storage.name,
            sizeBytes: storage.size,
            poolId: storage.poolId,
            devicePath: "", // 仮の値。実際にはハイパーバイザーがデバイスパスを生成する必要がある
          };
        }),
        securityGroupIds: data.securityGroupIds,
        name: data.name,
        cpu: spec.cpuCore,
        memoryBytes: spec.memoryBytes,
      };

      const res = await VirtualMachineRepository.create(insertData);
      if (!res.success) {
        return {
          success: false,
          error: {
            reason: "InternalError",
            message: res.error.message,
          },
        };
      }
      const vm = res.data;

      const created = await virtualMachineService.getById(vm.id);

      if (!created.success) {
        return {
          success: false,
          error: {
            reason: "InternalError",
            message: created.error.message,
          },
        };
      }
      if (!created.data) {
        return {
          success: false,
          error: {
            reason: "NotFound",
            message: `VirtualMachine with id ${vm.id} not found after creation`,
          },
        };
      }
      return {
        success: true,
        data: created.data,
      };
    },
    update: async (id, data) => {
      let spec;
      // スペックはインスタンスタイプでもらうこともある
      if (data.spec && "instanceTypeId" in data.spec) {
        const instanceTypeService = getInstanceTypeService(permission);
        const res = await instanceTypeService.getById(data.spec.instanceTypeId);
        if (!res.success) {
          return {
            success: false,
            error: {
              reason: "InternalError",
              message: res.error.message,
            },
          };
        }
        if (!res.data) {
          return {
            success: false,
            error: {
              reason: "BadRequest",
              message: `InstanceType with id ${data.spec.instanceTypeId} not found`,
            },
          };
        }
        spec = {
          cpuCore: res.data.cpuCore,
          memoryBytes: res.data.memorySize,
        };
      }

      const updateData: VirtualMachineUpdateProps = {
        name: data.name,
        cpu: spec?.cpuCore,
        memoryBytes: spec?.memoryBytes,
      };

      const res = await VirtualMachineRepository.update(id, updateData);
      if (!res.success) {
        if (res.error.reason === "NotFound") {
          return {
            success: false,
            error: {
              reason: "NotFound",
              message: `VirtualMachine with id ${id} not found`,
            },
          };
        }
        return {
          success: false,
          error: {
            reason: "InternalError",
            message: res.error.message,
          },
        };
      }

      const updatedVm = await virtualMachineService.getById(id);
      if (!updatedVm.success) {
        return {
          success: false,
          error: {
            reason: "InternalError",
            message: updatedVm.error.message,
          },
        };
      }
      return {
        success: true,
        data: updatedVm.data,
      };
    },
    delete: async (id) => {
      const res = await VirtualMachineRepository.deleteById(id);
      if (!res.success) {
        if (res.error.reason === "NotFound") {
          return {
            success: false,
            error: {
              reason: "NotFound",
              message: `VirtualMachine with id ${id} not found`,
            },
          };
        }
        return {
          success: false,
          error: {
            reason: "InternalError",
            message: res.error.message,
          },
        };
      }
      return {
        success: true,
        data: undefined,
      };
    },
    getStorageService(vmId) {
      const StorageService: ResourceService<
        StorageResponse,
        StorageCreateRequest,
        StoragePatchRequest | StoragePutRequest,
        ServiceError
      > = {
        list: async (query) => {
          const res = await VirtualMachineRepository.listStorages(vmId);
          if (!res.success) {
            return {
              success: false,
              error: {
                reason: "InternalError",
                message: res.error.message,
              },
            };
          }
          const storages = res.data;

          // ストレージプール情報も必要なので、ストレージプールIDを集める
          const poolIds = new Set<string>();
          storages.forEach((storage) => poolIds.add(storage.poolId));

          // ストレージプール情報の取得Promiseを作成
          const storagePoolService = getStoragePoolService(permission);
          const storagePoolPromises = Array.from(poolIds).map((poolId) =>
            storagePoolService.getById(poolId),
          );

          // 全てのPromiseを実行
          const results = await Promise.all(storagePoolPromises);
          for (const res of results) {
            if (!res.success) {
              return {
                success: false,
                error: {
                  reason: "InternalError",
                  message: res.error.message,
                },
              };
            }
          }

          // ストレージプールIDをキー、ストレージプール情報を値とするMapを作成
          const poolMap: Record<string, StoragePoolResponse> = {};
          results.forEach((res) => {
            const pool = (res as any).data as StoragePoolResponse;
            poolMap[pool.id] = pool;
          });

          // 最終的なレスポンスの作成
          const storageResponses = storages.map((storage) => {
            const pool = poolMap[storage.poolId];
            return toStorageResponse(storage, pool);
          });
          return { success: true, data: storageResponses };
        },
        getById: async (id) => {
          const res = await VirtualMachineRepository.getStorage(vmId, id);
          if (!res.success) {
            return {
              success: false,
              error: {
                reason: "InternalError",
                message: res.error.message,
              },
            };
          }
          if (!res.data) {
            return {
              success: false,
              error: {
                reason: "NotFound",
                message: `Storage with id ${id} not found for VirtualMachine with id ${vmId}`,
              },
            };
          }
          const storage = res.data;

          // ストレージプール情報の取得
          const storagePoolService = getStoragePoolService(permission);
          const poolRes = await storagePoolService.getById(storage.poolId);
          if (!poolRes.success) {
            return {
              success: false,
              error: {
                reason: "InternalError",
                message: poolRes.error.message,
              },
            };
          }
          if (!poolRes.data) {
            return {
              success: false,
              error: {
                reason: "NotFound",
                message: `StoragePool with id ${storage.poolId} not found for Storage with id ${id}`,
              },
            };
          }
          const pool = poolRes.data;

          // 最終的なレスポンスの作成
          const storageResponse = toStorageResponse(storage, pool);
          return { success: true, data: storageResponse };
        },
        create: async (data) => {
          const res = await VirtualMachineRepository.createStorage(vmId, {
            name: data.name,
            sizeBytes: data.size,
            poolId: data.poolId,
            devicePath: "", // 仮の値。実際にはハイパーバイザーがデバイスパスを生成する必要がある
          });
          if (!res.success) {
            return {
              success: false,
              error: {
                reason: "InternalError",
                message: res.error.message,
              },
            };
          }

          const createdStorage = await StorageService.getById(res.data.id);
          if (!createdStorage.success) {
            return {
              success: false,
              error: {
                reason: "InternalError",
                message: createdStorage.error.message,
              },
            };
          }
          if (!createdStorage.data) {
            return {
              success: false,
              error: {
                reason: "NotFound",
                message: `Storage with id ${res.data.id} not found for VirtualMachine with id ${vmId} after creation`,
              },
            };
          }
          return {
            success: true,
            data: createdStorage.data,
          };
        },
        update: async (id, data) => {
          const repoRes = await VirtualMachineRepository.updateStorage(
            vmId,
            id,
            {
              name: data.name,
            },
          );

          if (!repoRes.success) {
            if (repoRes.error.reason === "NotFound") {
              return {
                success: false,
                error: {
                  reason: "NotFound",
                  message: `Storage with id ${id} not found for VirtualMachine with id ${vmId}`,
                },
              };
            }
            return {
              success: false,
              error: {
                reason: "InternalError",
                message: repoRes.error.message,
              },
            };
          }
          const updatedStorage = await StorageService.getById(repoRes.data.id);
          if (!updatedStorage.success) {
            return updatedStorage;
          }
          return { success: true, data: updatedStorage.data };
        },
        delete: async (id) => {
          const res = await VirtualMachineRepository.deleteStorage(vmId, id);
          if (!res.success) {
            if (res.error.reason === "NotFound") {
              return {
                success: false,
                error: {
                  reason: "NotFound",
                  message: `Storage with id ${id} not found for VirtualMachine with id ${vmId}`,
                },
              };
            }
            return {
              success: false,
              error: {
                reason: "InternalError",
                message: res.error.message,
              },
            };
          }
          return {
            success: true,
            data: undefined,
          };
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
        list: async (query) => {
          const res =
            await VirtualMachineRepository.listNetworkInterfaces(vmId);

          if (!res.success) {
            return {
              success: false,
              error: {
                reason: "InternalError",
                message: res.error.message,
              },
            };
          }
          const nics = res.data;

          // ネットワークインターフェースが属するvnetが重複するケースはあるので、vnetIdを集める
          const vnetIds = new Set<string>();
          nics.forEach((nic) => vnetIds.add(nic.vnetId));

          // vnet情報の取得Promiseを作成
          const virtualNetworkService = getVirtualNetworkService(permission);
          const virtualNetworkPromises = Array.from(vnetIds).map((vnetId) =>
            virtualNetworkService.getById(vnetId),
          );

          // 全てのPromiseを実行
          const results = await Promise.all(virtualNetworkPromises);
          for (const res of results) {
            if (!res.success) {
              return {
                success: false,
                error: {
                  reason: "InternalError",
                  message: res.error.message,
                },
              };
            }
          }

          // vnetIdをキー、サブネット情報を値とするMapを作成
          const subnetMap: Record<string, SubnetResponse> = {};
          results.forEach((res) => {
            const vnet: VirtualNetworkResponse = (res as any).data;
            vnet.subnets.forEach((subnet) => {
              subnetMap[subnet.id] = subnet;
            });
          });
          // 最終的なレスポンスの作成
          const nicResponses = nics.map((nic) => {
            const subnet = subnetMap[nic.vnetId];
            return toNetworkResponse(nic, subnet);
          });
          return { success: true, data: nicResponses };
        },
        getById: async (id) => {
          const res = await VirtualMachineRepository.getNetworkInterface(
            vmId,
            id,
          );
          if (!res.success) {
            return {
              success: false,
              error: {
                reason: "InternalError",
                message: res.error.message,
              },
            };
          }
          if (!res.data) {
            return {
              success: false,
              error: {
                reason: "NotFound",
                message: `NetworkInterface with id ${id} not found`,
              },
            };
          }
          const nic = res.data;

          // vnet情報の取得
          const virtualNetworkService = getVirtualNetworkService(permission);
          const vnetRes = await virtualNetworkService.getById(nic.vnetId);
          if (!vnetRes.success) {
            return {
              success: false,
              error: {
                reason: "InternalError",
                message: vnetRes.error.message,
              },
            };
          }
          if (!vnetRes.data) {
            return {
              success: false,
              error: {
                reason: "NotFound",
                message: `VirtualNetwork with id ${nic.vnetId} not found for NetworkInterface with id ${id}`,
              },
            };
          }
          const vnet = vnetRes.data;

          // サブネット情報の取得
          const subnet = vnet.subnets.find((s) => s.id === nic.subnetId);
          if (!subnet) {
            return {
              success: false,
              error: {
                reason: "NotFound",
                message: `Subnet with id ${nic.subnetId} not found in VirtualNetwork with id ${nic.vnetId} for NetworkInterface with id ${id}`,
              },
            };
          }

          // 最終的なレスポンスの作成
          const nicResponse = toNetworkResponse(nic, subnet);
          return { success: true, data: nicResponse };
        },
        create: async (data) => {
          const res = await VirtualMachineRepository.createNetworkInterface(
            vmId,
            {
              name: data.name || `nic-${data.subnetId}`,
              macAddress: "",
              ipAddress: "",
              subnetId: data.subnetId,
            },
          );
          if (!res.success) {
            return {
              success: false,
              error: {
                reason: "InternalError",
                message: res.error.message,
              },
            };
          }

          const createdNic = await NetworkInterfaceService.getById(res.data.id);
          if (!createdNic.success) {
            return {
              success: false,
              error: {
                reason: "InternalError",
                message: createdNic.error.message,
              },
            };
          }
          if (!createdNic.data) {
            return {
              success: false,
              error: {
                reason: "NotFound",
                message: `NetworkInterface with id ${res.data.id} not found for VirtualMachine with id ${vmId} after creation`,
              },
            };
          }
          return {
            success: true,
            data: createdNic.data,
          };
        },
        update: async (id, data) => {
          const repoRes = await VirtualMachineRepository.updateNetworkInterface(
            vmId,
            id,
            {
              name: data.name,
            },
          );

          if (!repoRes.success) {
            if (repoRes.error.reason === "NotFound") {
              return {
                success: false,
                error: {
                  reason: "NotFound",
                  message: `NetworkInterface with id ${id} not found for VirtualMachine with id ${vmId}`,
                },
              };
            }
            return {
              success: false,
              error: {
                reason: "InternalError",
                message: repoRes.error.message,
              },
            };
          }
          const updatedNic = await NetworkInterfaceService.getById(
            repoRes.data.id,
          );
          if (!updatedNic.success) {
            return updatedNic;
          }
          return { success: true, data: updatedNic.data };
        },
        delete: async (id) => {
          const res = await VirtualMachineRepository.deleteNetworkInterface(
            vmId,
            id,
          );
          if (!res.success) {
            if (res.error.reason === "NotFound") {
              return {
                success: false,
                error: {
                  reason: "NotFound",
                  message: `NetworkInterface with id ${id} not found for VirtualMachine with id ${vmId}`,
                },
              };
            }

            return {
              success: false,
              error: {
                reason: "InternalError",
                message: res.error.message,
              },
            };
          }
          return { success: true, data: res.data };
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
        list: async (query) => {
          const res = await VirtualMachineRepository.listSecurityGroups(vmId);
          if (!res.success) {
            return {
              success: false,
              error: {
                reason: "InternalError",
                message: res.error.message,
              },
            };
          }
          const sgService = getSecurityGroupService(permission);
          const sgPromises = res.data.map((sgId) => sgService.getById(sgId));
          const sgResults = await Promise.all(sgPromises);
          for (const res of sgResults) {
            if (!res.success) {
              return {
                success: false,
                error: {
                  reason: "InternalError",
                  message: res.error.message,
                },
              };
            }
          }
          const securityGroups = sgResults.map((res) => (res as any).data);
          return { success: true, data: securityGroups };
        },
        getById: async (id) => {
          // ID知ってるならセキュリティグループに聞いて
          // PrimiseでBadRequestを返すだけ
          return await new Promise<Result<SecurityGroupResponse, ServiceError>>(
            (resolve) => {
              resolve({
                success: false,
                error: {
                  reason: "BadRequest",
                  message:
                    "Use SecurityGroupService to get security group details",
                },
              });
            },
          );
        },
        create: async (data) => {
          // 仮想マシンにセキュリティグループを追加
          const res = await VirtualMachineRepository.addSecurityGroup(
            vmId,
            data.securityGroupId,
          );
          if (!res.success) {
            return {
              success: false,
              error: {
                reason: "InternalError",
                message: res.error.message,
              },
            };
          }
          const sgService = getSecurityGroupService(permission);
          const addedSg = await sgService.getById(data.securityGroupId);
          if (!addedSg.success) {
            return {
              success: false,
              error: {
                reason: "InternalError",
                message: addedSg.error.message,
              },
            };
          }
          return { success: true, data: addedSg.data };
        },
        update: async (id, data) => {
          return await new Promise<Result<never, ServiceError>>((resolve) => {
            resolve({
              success: false,
              error: {
                reason: "BadRequest",
                message:
                  "Update operation is not supported for security groups of a virtual machine",
              },
            });
          });
        },
        delete: async (id) => {
          const res = await VirtualMachineRepository.removeSecurityGroup(
            vmId,
            id,
          );
          if (!res.success) {
            if (res.error.reason === "NotFound") {
              return {
                success: false,
                error: {
                  reason: "NotFound",
                  message: `SecurityGroup with id ${id} not found for VirtualMachine with id ${vmId}`,
                },
              };
            }
            return {
              success: false,
              error: {
                reason: "InternalError",
                message: res.error.message,
              },
            };
          }
          return { success: true, data: undefined };
        },
      };
      return VmSecurityGroupService;
    },
    getPowerService(vmId) {
      const powerService: VirtualMachinePowerService = {
        start: async () => {
          return { success: true, data: "Accepted" };
        },
        shutdown: async () => {
          return { success: true, data: "Accepted" };
        },
        stop: async () => {
          return { success: true, data: "Accepted" };
        },
        reboot: async () => {
          return { success: true, data: "Accepted" };
        },
        reset: async () => {
          return { success: true, data: "Accepted" };
        },
      };
      return powerService;
    },
  };
  return virtualMachineService;
};
