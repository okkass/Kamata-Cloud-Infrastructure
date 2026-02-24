import { getPrismaClient } from "./common";
import { Prisma } from "@@/generated/client";
import type { Result } from "@/common/type";
import type { RepositoryError } from "@/common/errors";
import type { Repository } from "./common";
import { PrismaClientKnownRequestError } from "@@/generated/internal/prismaNamespace";

// selectで絞るカラムを定義
// リレーション先はServiceを通じて得るためuuidのみ取得する

const attachedStoragesArgs = {
  select: {
    path: true,
    virtualStorage: {
      select: {
        uuid: true,
        name: true,
        sizeMb: true,
        createdAt: true,
        storagePool: {
          select: {
            uuid: true,
          },
        },
      },
    },
  },
} satisfies Prisma.VirtualMachineAttachedStorageFindManyArgs;

const networkInterfaceArgs = {
  select: {
    id: true,
    uuid: true,
    name: true,
    ipAddress: true,
    macAddress: true,
    subnet: {
      select: {
        uuid: true,
        virtualNetwork: {
          select: {
            uuid: true,
          },
        },
      },
    },
  },
} satisfies Prisma.NetworkInterfaceFindManyArgs;

const virtualMachineArgs = {
  select: {
    id: true,
    uuid: true,
    name: true,
    status: true,
    cpu: true,
    memoryMb: true,
    createdAt: true,
    attachedStorages: attachedStoragesArgs,
    networkInterfaces: networkInterfaceArgs,
    node: {
      select: {
        uuid: true,
      },
    },
    user: {
      select: {
        uuid: true,
        name: true,
      },
    },
    securityGroups: {
      select: {
        securityGroup: {
          select: {
            uuid: true,
          },
        },
      },
    },
  },
} satisfies Prisma.VirtualMachineFindManyArgs;

export type NetworkInterfaceInsertProps = {
  name: string;
  ipAddress: string;
  macAddress: string;
  subnetId: string;
};
export type StorageInsertProps = {
  name: string;
  sizeBytes: number;
  poolId: string;
  devicePath: string;
};

export type VirtualMachineInsertProps = {
  userId: string;
  nodeId: string;
  imageId: string;
  nics: NetworkInterfaceInsertProps[];
  storages: StorageInsertProps[];
  securityGroupIds: string[];
  name: string;
  cpu: number;
  memoryBytes: number;
};

export type StorageRecord = {
  id: string;
  name: string;
  sizeBytes: number;
  createdAt: Date;
  poolId: string;
  devicePath: string;
};
export type NetworkInterfaceRecord = {
  id: string;
  name: string;
  ipAddress: string;
  macAddress: string;
  subnetId: string;
  vnetId: string;
};

export type VirtualMachineRecord = {
  id: string;
  name: string;
  status: "running" | "stopped" | "pending";
  nodeId: string;
  createdAt: Date;
  owner: {
    id: string;
    name: string;
  };
  securityGroupIds: string[];
  storages: StorageRecord[];
  networkInterfaces: NetworkInterfaceRecord[];
  cpuCore: number;
  memoryBytes: number;
};

export type VirtualMachineUpdateProps = {
  name?: string;
  cpu?: number;
  memoryBytes?: number;
  status?: "running" | "stopped" | "pending";
};

export type NetworkInterfaceUpdateProps = {
  name?: string;
  ipAddress?: string;
  macAddress?: string;
  subnetId?: string;
};

export type StorageUpdateProps = {
  name?: string;
};

const toStorageRecord = (
  record: Prisma.VirtualMachineAttachedStorageGetPayload<
    typeof attachedStoragesArgs
  >,
): StorageRecord => {
  return {
    id: record.virtualStorage.uuid,
    name: record.virtualStorage.name,
    sizeBytes: mbToBytes(record.virtualStorage.sizeMb),
    createdAt: record.virtualStorage.createdAt,
    poolId: record.virtualStorage.storagePool.uuid,
    devicePath: record.path,
  };
};

const toNetworkInterfaceRecord = (
  record: Prisma.NetworkInterfaceGetPayload<typeof networkInterfaceArgs>,
): NetworkInterfaceRecord => {
  return {
    id: record.uuid,
    name: record.name,
    ipAddress: record.ipAddress,
    macAddress: record.macAddress,
    subnetId: record.subnet.uuid,
    vnetId: record.subnet.virtualNetwork.uuid,
  };
};

const toVirtualMachineRecord = (
  record: Prisma.VirtualMachineGetPayload<typeof virtualMachineArgs>,
): VirtualMachineRecord => {
  return {
    id: record.uuid,
    name: record.name,
    status: record.status,
    nodeId: record.node.uuid,
    createdAt: record.createdAt,
    owner: {
      id: record.user.uuid,
      name: record.user.name,
    },
    securityGroupIds: record.securityGroups.map((sg) => sg.securityGroup.uuid),
    storages: record.attachedStorages.map(toStorageRecord),
    networkInterfaces: record.networkInterfaces.map(toNetworkInterfaceRecord),
    cpuCore: record.cpu,
    memoryBytes: mbToBytes(record.memoryMb),
  };
};

type VirtualMachineRepositoryType = Repository<
  VirtualMachineInsertProps,
  VirtualMachineUpdateProps,
  VirtualMachineRecord
> & {
  listNetworkInterfaces: (
    virtualMachineId: string,
  ) => Promise<Result<NetworkInterfaceRecord[], RepositoryError>>;
  getNetworkInterface: (
    virtualMachineId: string,
    networkInterfaceId: string,
  ) => Promise<Result<NetworkInterfaceRecord | null, RepositoryError>>;
  createNetworkInterface: (
    vmId: string,
    props: NetworkInterfaceInsertProps,
  ) => Promise<Result<NetworkInterfaceRecord, RepositoryError>>;
  updateNetworkInterface: (
    virtualMachineId: string,
    networkInterfaceId: string,
    props: NetworkInterfaceUpdateProps,
  ) => Promise<Result<NetworkInterfaceRecord, RepositoryError>>;
  deleteNetworkInterface: (
    virtualMachineId: string,
    networkInterfaceId: string,
  ) => Promise<Result<void, RepositoryError>>;
  listStorages: (
    virtualMachineId: string,
  ) => Promise<Result<StorageRecord[], RepositoryError>>;
  getStorage: (
    virtualMachineId: string,
    storageId: string,
  ) => Promise<Result<StorageRecord | null, RepositoryError>>;
  createStorage: (
    vmId: string,
    props: StorageInsertProps,
  ) => Promise<Result<StorageRecord, RepositoryError>>;
  updateStorage: (
    virtualMachineId: string,
    storageId: string,
    props: StorageUpdateProps,
  ) => Promise<Result<StorageRecord, RepositoryError>>;
  deleteStorage: (
    virtualMachineId: string,
    storageId: string,
  ) => Promise<Result<void, RepositoryError>>;
  listSecurityGroups: (
    virtualMachineId: string,
  ) => Promise<Result<string[], RepositoryError>>;
  addSecurityGroup: (
    virtualMachineId: string,
    securityGroupId: string,
  ) => Promise<Result<void, RepositoryError>>;
  removeSecurityGroup: (
    virtualMachineId: string,
    securityGroupId: string,
  ) => Promise<Result<void, RepositoryError>>;
};

export const VirtualMachineRepository: VirtualMachineRepositoryType = {
  list: async (userUuid?: string) => {
    try {
      const prisma = getPrismaClient();

      // userUuidが与えられた場合、まずはidを引く
      let userId: bigint | undefined = undefined;
      if (userUuid) {
        const user = await prisma.user.findUnique({
          where: { uuid: userUuid },
          select: { id: true },
        });
        // userId見つからない場合、エラーを投げる
        if (!user) {
          throw new Error("User not found");
        }
        userId = user.id;
      }
      const whereClause = userId ? { userId } : {};
      const records = await prisma.virtualMachine.findMany({
        where: whereClause,
        ...virtualMachineArgs,
      });
      return {
        success: true,
        data: records.map(toVirtualMachineRecord),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          reason: "InternalError",
          message: (error as Error).message,
        },
      };
    }
  },
  getById: async (id: string) => {
    try {
      const prisma = getPrismaClient();
      const record = await prisma.virtualMachine.findUnique({
        where: { uuid: id },
        ...virtualMachineArgs,
      });
      if (!record) {
        return {
          success: true,
          data: null,
        };
      }
      return {
        success: true,
        data: toVirtualMachineRecord(record),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          reason: "InternalError",
          message: (error as Error).message,
        },
      };
    }
  },
  create: async (props: VirtualMachineInsertProps) => {
    try {
      const prisma = getPrismaClient();

      const created = await prisma.virtualMachine.create({
        data: {
          name: props.name,
          status: "pending",
          cpu: props.cpu,
          memoryMb: bytesToMb(props.memoryBytes),
          node: {
            connect: {
              uuid: props.nodeId,
            },
          },
          image: {
            connect: {
              uuid: props.imageId,
            },
          },
          user: {
            connect: {
              uuid: props.userId,
            },
          },
          networkInterfaces: {
            create: props.nics.map((nic) => ({
              name: nic.name,
              ipAddress: nic.ipAddress,
              macAddress: nic.macAddress,
              subnet: {
                connect: {
                  uuid: nic.subnetId,
                },
              },
            })),
          },
          attachedStorages: {
            create: props.storages.map((storage) => ({
              path: storage.devicePath,
              virtualStorage: {
                create: {
                  name: storage.name,
                  sizeMb: bytesToMb(storage.sizeBytes),
                  storagePool: {
                    connect: {
                      uuid: storage.poolId,
                    },
                  },
                },
              },
            })),
          },
          securityGroups: {
            create: props.securityGroupIds.map((sgId) => ({
              securityGroup: {
                connect: {
                  uuid: sgId,
                },
              },
            })),
          },
        },
        ...virtualMachineArgs,
      });

      return {
        success: true,
        data: toVirtualMachineRecord(created),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          reason: "InternalError",
          message: (error as Error).message,
        },
      };
    }
  },
  update: async (id: string, props: VirtualMachineUpdateProps) => {
    try {
      const prisma = getPrismaClient();
      const updated = await prisma.virtualMachine.update({
        where: { uuid: id },
        data: {
          name: props.name,
          cpu: props.cpu,
          memoryMb: props.memoryBytes
            ? bytesToMb(props.memoryBytes)
            : undefined,
          status: props.status,
        },
        ...virtualMachineArgs,
      });
      return {
        success: true,
        data: toVirtualMachineRecord(updated),
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        // P2025は、更新対象が見つからないエラー
        if (error.code === "P2025") {
          return {
            success: false,
            error: {
              reason: "NotFound",
              message: `Virtual machine with id ${id} not found`,
            },
          };
        }
      }
      return {
        success: false,
        error: {
          reason: "InternalError",
          message: (error as Error).message,
        },
      };
    }
  },
  deleteById: async (id: string) => {
    try {
      const prisma = getPrismaClient();
      await prisma.virtualMachine.delete({
        where: { uuid: id },
      });
      return {
        success: true,
        data: undefined,
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        // P2025は、削除対象が見つからないエラー
        if (error.code === "P2025") {
          return {
            success: false,
            error: {
              reason: "NotFound",
              message: `Virtual machine with id ${id} not found`,
            },
          };
        }
      }
      return {
        success: false,
        error: {
          reason: "InternalError",
          message: (error as Error).message,
        },
      };
    }
  },
  listNetworkInterfaces: async (virtualMachineId: string) => {
    try {
      const prisma = getPrismaClient();
      const interfaces = await prisma.networkInterface.findMany({
        where: {
          virtualMachine: {
            uuid: virtualMachineId,
          },
        },
        ...networkInterfaceArgs,
      });
      return {
        success: true,
        data: interfaces.map(toNetworkInterfaceRecord),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          reason: "InternalError",
          message: (error as Error).message,
        },
      };
    }
  },
  getNetworkInterface: async (
    virtualMachineId: string,
    networkInterfaceId: string,
  ) => {
    try {
      const prisma = getPrismaClient();
      const networkInterface = await prisma.networkInterface.findFirst({
        where: {
          uuid: networkInterfaceId,
          virtualMachine: {
            uuid: virtualMachineId,
          },
        },
        ...networkInterfaceArgs,
      });
      if (!networkInterface) {
        return {
          success: true,
          data: null,
        };
      }
      return {
        success: true,
        data: toNetworkInterfaceRecord(networkInterface),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          reason: "InternalError",
          message: (error as Error).message,
        },
      };
    }
  },
  createNetworkInterface: async (
    vmId: string,
    props: NetworkInterfaceInsertProps,
  ) => {
    try {
      const prisma = getPrismaClient();
      const created = await prisma.networkInterface.create({
        data: {
          name: props.name,
          ipAddress: props.ipAddress,
          macAddress: props.macAddress,
          virtualMachine: {
            connect: {
              uuid: vmId,
            },
          },
          subnet: {
            connect: {
              uuid: props.subnetId,
            },
          },
        },
        ...networkInterfaceArgs,
      });
      return {
        success: true,
        data: toNetworkInterfaceRecord(created),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          reason: "InternalError",
          message: (error as Error).message,
        },
      };
    }
  },
  updateNetworkInterface: async (
    virtualMachineId: string,
    networkInterfaceId: string,
    props: NetworkInterfaceUpdateProps,
  ) => {
    try {
      const prisma = getPrismaClient();

      // 更新対象が存在するか確認
      const nic = await prisma.networkInterface.findFirst({
        where: {
          uuid: networkInterfaceId,
          virtualMachine: {
            uuid: virtualMachineId,
          },
        },
      });
      // 存在しない場合はエラー
      if (!nic) {
        return {
          success: false,
          error: {
            reason: "NotFound",
            message: "Network interface not found",
          },
        };
      }

      // subnetがあればidを引く
      let subnetId: bigint | undefined = undefined;
      if (props.subnetId) {
        const subnet = await prisma.subnet.findUnique({
          where: { uuid: props.subnetId },
          select: { id: true },
        });
        if (!subnet) {
          return {
            success: false,
            error: {
              reason: "NotFound",
              message: "Subnet not found",
            },
          };
        }
        subnetId = subnet.id;
      }

      const updated = await prisma.networkInterface.update({
        where: { uuid: networkInterfaceId },
        data: {
          name: props.name,
          ipAddress: props.ipAddress,
          macAddress: props.macAddress,
          subnetId,
        },
        ...networkInterfaceArgs,
      });
      return {
        success: true,
        data: toNetworkInterfaceRecord(updated),
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        // P2025は、更新対象が見つからないエラー
        if (error.code === "P2025") {
          return {
            success: false,
            error: {
              reason: "NotFound",
              message: "Network interface not found",
            },
          };
        }
      }
      return {
        success: false,
        error: {
          reason: "InternalError",
          message: (error as Error).message,
        },
      };
    }
  },
  deleteNetworkInterface: async (
    virtualMachineId: string,
    networkInterfaceId: string,
  ) => {
    try {
      const prisma = getPrismaClient();

      // 削除対象がvbmIdに紐づいているか確認
      const nic = await prisma.networkInterface.findFirst({
        where: {
          uuid: networkInterfaceId,
          virtualMachine: {
            uuid: virtualMachineId,
          },
        },
      });
      if (!nic) {
        return {
          success: false,
          error: {
            reason: "NotFound",
            message: "Network interface not found",
          },
        };
      }

      await prisma.networkInterface.delete({
        where: { uuid: networkInterfaceId },
      });
      return {
        success: true,
        data: undefined,
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        // P2025は、削除対象が見つからないエラー
        if (error.code === "P2025") {
          return {
            success: false,
            error: {
              reason: "NotFound",
              message: "Network interface not found",
            },
          };
        }
      }
      return {
        success: false,
        error: {
          reason: "InternalError",
          message: (error as Error).message,
        },
      };
    }
  },
  listStorages: async (virtualMachineId: string) => {
    try {
      const prisma = getPrismaClient();

      const storages = await prisma.virtualMachineAttachedStorage.findMany({
        where: {
          virtualMachine: {
            uuid: virtualMachineId,
          },
        },
        ...attachedStoragesArgs,
      });
      return {
        success: true,
        data: storages.map(toStorageRecord),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          reason: "InternalError",
          message: (error as Error).message,
        },
      };
    }
  },
  getStorage: async (virtualMachineId: string, storageId: string) => {
    try {
      const prisma = getPrismaClient();
      const vmPromise = prisma.virtualMachine.findUnique({
        where: { uuid: virtualMachineId },
        select: {
          id: true,
        },
      });
      const storagePromise = prisma.virtualStorage.findUnique({
        where: { uuid: storageId },
        select: {
          id: true,
        },
      });
      const [vm, storage] = await Promise.all([vmPromise, storagePromise]);
      if (!vm || !storage) {
        return {
          success: false,
          error: {
            reason: "NotFound",
            message: "Virtual machine or storage not found",
          },
        };
      }

      const attachedStorage =
        await prisma.virtualMachineAttachedStorage.findUnique({
          where: {
            virtualMachineId_virtualStorageId: {
              virtualMachineId: vm.id,
              virtualStorageId: storage.id,
            },
          },
          ...attachedStoragesArgs,
        });
      if (!attachedStorage) {
        return {
          success: true,
          data: null,
        };
      }
      return {
        success: true,
        data: toStorageRecord(attachedStorage),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          reason: "InternalError",
          message: (error as Error).message,
        },
      };
    }
  },
  createStorage: async (vmId: string, props: StorageInsertProps) => {
    try {
      const prisma = getPrismaClient();
      const created = await prisma.virtualMachineAttachedStorage.create({
        data: {
          path: props.devicePath,
          virtualMachine: {
            connect: {
              uuid: vmId,
            },
          },
          virtualStorage: {
            create: {
              name: props.name,
              sizeMb: bytesToMb(props.sizeBytes),
              storagePool: {
                connect: {
                  uuid: props.poolId,
                },
              },
            },
          },
        },
        ...attachedStoragesArgs,
      });
      return {
        success: true,
        data: toStorageRecord(created),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          reason: "InternalError",
          message: (error as Error).message,
        },
      };
    }
  },
  updateStorage: async (
    virtualMachineId: string,
    storageId: string,
    props: StorageUpdateProps,
  ) => {
    try {
      const prisma = getPrismaClient();

      // 更新対象が存在するか確認
      const vmPromise = prisma.virtualMachine.findUnique({
        where: { uuid: virtualMachineId },
        select: {
          id: true,
        },
      });
      const storagePromise = prisma.virtualStorage.findUnique({
        where: { uuid: storageId },
        select: {
          id: true,
        },
      });
      const [vm, storage] = await Promise.all([vmPromise, storagePromise]);
      if (!vm || !storage) {
        return {
          success: false,
          error: {
            reason: "NotFound",
            message: "Virtual machine or storage not found",
          },
        };
      }

      const updated = await prisma.virtualMachineAttachedStorage.update({
        where: {
          virtualMachineId_virtualStorageId: {
            virtualMachineId: vm.id,
            virtualStorageId: storage.id,
          },
        },
        data: {
          virtualStorage: {
            update: {
              name: props.name,
            },
          },
        },
        ...attachedStoragesArgs,
      });
      return {
        success: true,
        data: toStorageRecord(updated),
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        // P2025は、更新対象が見つからないエラー
        if (error.code === "P2025") {
          return {
            success: false,
            error: {
              reason: "NotFound",
              message: "Virtual machine or storage not found",
            },
          };
        }
      }
      return {
        success: false,
        error: {
          reason: "InternalError",
          message: (error as Error).message,
        },
      };
    }
  },
  deleteStorage: async (virtualMachineId: string, storageId: string) => {
    try {
      const prisma = getPrismaClient();

      // 削除対象がvbmIdに紐づいているか確認
      const vmPromise = prisma.virtualMachine.findUnique({
        where: { uuid: virtualMachineId },
        select: {
          id: true,
        },
      });
      const storagePromise = prisma.virtualStorage.findUnique({
        where: { uuid: storageId },
        select: {
          id: true,
        },
      });
      const [vm, storage] = await Promise.all([vmPromise, storagePromise]);

      if (!vm || !storage) {
        return {
          success: false,
          error: {
            reason: "NotFound",
            message: "Virtual machine or storage not found",
          },
        };
      }

      await prisma.virtualMachineAttachedStorage.delete({
        where: {
          virtualMachineId_virtualStorageId: {
            virtualMachineId: vm.id,
            virtualStorageId: storage.id,
          },
        },
      });
      await prisma.virtualStorage.delete({
        where: { id: storage.id },
      });
      return {
        success: true,
        data: undefined,
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        // P2025は、削除対象が見つからないエラー
        if (error.code === "P2025") {
          return {
            success: false,
            error: {
              reason: "NotFound",
              message: "Virtual storage not found",
            },
          };
        }
      }

      return {
        success: false,
        error: {
          reason: "InternalError",
          message: (error as Error).message,
        },
      };
    }
  },
  listSecurityGroups: async (virtualMachineId: string) => {
    try {
      const prisma = getPrismaClient();
      const sg = await prisma.virtualMachineSecurityGroup.findMany({
        where: {
          virtualMachine: {
            uuid: virtualMachineId,
          },
        },
        select: {
          securityGroup: {
            select: {
              uuid: true,
            },
          },
        },
      });
      return {
        success: true,
        data: sg.map((s) => s.securityGroup.uuid),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          reason: "InternalError",
          message: (error as Error).message,
        },
      };
    }
  },
  addSecurityGroup: async (vmId: string, sgId: string) => {
    try {
      const prisma = getPrismaClient();
      await prisma.virtualMachineSecurityGroup.create({
        data: {
          virtualMachine: {
            connect: {
              uuid: vmId,
            },
          },
          securityGroup: {
            connect: {
              uuid: sgId,
            },
          },
        },
      });
      return {
        success: true,
        data: undefined,
      };
    } catch (error) {
      // すでに同じセキュリティグループが追加されている場合は、PrismaClientKnownRequestErrorが発生する
      // その場合はエラーとせずに成功とする
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return {
            success: true,
            data: undefined,
          };
        }
      }
      return {
        success: false,
        error: {
          reason: "InternalError",
          message: (error as Error).message,
        },
      };
    }
  },
  removeSecurityGroup: async (vmId: string, sgId: string) => {
    try {
      const prisma = getPrismaClient();
      // uuidからidを引く
      const vmPromise = prisma.virtualMachine.findUnique({
        where: { uuid: vmId },
        select: { id: true },
      });
      const sgPromise = prisma.securityGroup.findUnique({
        where: { uuid: sgId },
        select: { id: true },
      });
      const [vm, sg] = await Promise.all([vmPromise, sgPromise]);
      if (!vm || !sg) {
        return {
          success: false,
          error: {
            reason: "NotFound",
            message: "Virtual machine or security group not found",
          },
        };
      }

      await prisma.virtualMachineSecurityGroup.delete({
        where: {
          virtualMachineId_securityGroupId: {
            virtualMachineId: vm.id,
            securityGroupId: sg.id,
          },
        },
      });
      return {
        success: true,
        data: undefined,
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        // P2025は、削除対象が見つからないエラー
        if (error.code === "P2025") {
          return {
            success: false,
            error: {
              reason: "NotFound",
              message: "Virtual machine or security group not found",
            },
          };
        }
      }
      return {
        success: false,
        error: {
          reason: "InternalError",
          message: (error as Error).message,
        },
      };
    }
  },
};

export default VirtualMachineRepository;
