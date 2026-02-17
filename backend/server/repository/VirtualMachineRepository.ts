import { getPrismaClient } from "./common";
import { Prisma } from "@@/generated/client";
import type { Result } from "@/common/type";
import type { RepositoryError } from "@/common/errors";
import type { Repository } from "./common";
import { PrismaClientKnownRequestError } from "@@/generated/internal/prismaNamespace";
import { uuid } from "zod";

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
};

export type VirtualMachineRecord = {
  id: string;
  name: string;
  status: string;
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

type VirtualMachineRepository = Repository<
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
  ) => Promise<Result<NetworkInterfaceRecord, RepositoryError>>;
  listStorages: (
    virtualMachineId: string,
  ) => Promise<Result<StorageRecord[], RepositoryError>>;
  getStorage: (
    virtualMachineId: string,
    storageId: string,
  ) => Promise<Result<StorageRecord, RepositoryError>>;
  listSecurityGroups: (
    virtualMachineId: string,
  ) => Promise<Result<string[], RepositoryError>>;
};

export const VirtualMachineRepository: VirtualMachineRepository = {
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
          success: false,
          error: {
            reason: "NotFound",
            message: "Virtual machine not found",
          },
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
        },
        ...virtualMachineArgs,
      });
      // sgのUUID->IDを引く
      const securityGroups = await prisma.securityGroup.findMany({
        where: {
          uuid: {
            in: props.securityGroupIds,
          },
        },
        select: {
          id: true,
          uuid: true,
        },
      });
      // 中間テーブルデータ挿入のPromise配列を作成
      const vmSgCreatePromises = securityGroups.map((sg) =>
        prisma.virtualMachineSecurityGroup.create({
          data: {
            virtualMachineId: created.id,
            securityGroupId: sg.id,
          },
        }),
      );
      // ストレージの作成と中間テーブルデータ挿入のPromise配列を作成
      const storageCreatePromises = props.storages.map((storage) => {
        return prisma.virtualMachineAttachedStorage.create({
          data: {
            virtualMachineId: created.id,
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
          },
        });
      });
    } catch (error) {}
  },
};

export default VirtualMachineRepository;
