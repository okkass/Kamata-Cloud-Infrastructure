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

export const VirtualMachineRepository = {
  list,
  getById,
  create,
  update,
  deleteById,
  listNetworkInterfacesByVirtualMachineId,
  getNetworkInterface,
  listStoragesByVirtualMachineId,
  getStorage,
  listSecurityGroupsByVirtualMachineId,
};

export default VirtualMachineRepository;
