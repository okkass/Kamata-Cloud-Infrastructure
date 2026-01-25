import { getPrismaClient } from "./common";
import { Prisma } from "@@/generated/client";

// Nodeの情報はUUIDから別途Serviceたたいてください
const StoragePoolArgs = {
  select: {
    uuid: true,
    name: true,
    hasNetworkAccess: true,
    availableSizeMb: true,
    totalSizeMb: true,
    createdAt: true,
    node: {
      select: {
        uuid: true,
      },
    },
  },
} satisfies Prisma.StoragePoolFindManyArgs;

export type StoragePoolRecord = Prisma.StoragePoolGetPayload<
  typeof StoragePoolArgs
>;

export type StoragePoolCreateInput = {
  name: string;
  hasNetworkAccess: boolean;
  totalSizeMb: number;
  nodeId: string;
};

export type StoragePoolUpdateInput = {
  name?: string;
  hasNetworkAccess?: boolean;
};

const list = async (): Promise<Array<StoragePoolRecord>> => {
  const prisma = getPrismaClient();
  return await prisma.storagePool.findMany(StoragePoolArgs);
};

const getById = (id: string): Promise<StoragePoolRecord | null> => {
  const prisma = getPrismaClient();
  return prisma.storagePool.findUnique({
    where: { uuid: id },
    ...StoragePoolArgs,
  });
};

const add = async (
  input: StoragePoolCreateInput,
): Promise<StoragePoolRecord> => {
  const prisma = getPrismaClient();
  return await prisma.storagePool.create({
    data: {
      name: input.name,
      hasNetworkAccess: input.hasNetworkAccess,
      totalSizeMb: input.totalSizeMb,
      availableSizeMb: input.totalSizeMb,
      node: {
        connect: { uuid: input.nodeId },
      },
    },
    ...StoragePoolArgs,
  });
};

const update = async (
  id: string,
  updateFields: StoragePoolUpdateInput,
): Promise<StoragePoolRecord> => {
  const prisma = getPrismaClient();
  return await prisma.storagePool.update({
    where: { uuid: id },
    data: {
      name: updateFields.name,
      hasNetworkAccess: updateFields.hasNetworkAccess,
    },
    ...StoragePoolArgs,
  });
};

const deleteById = async (id: string): Promise<void> => {
  const prisma = getPrismaClient();
  await prisma.storagePool.delete({ where: { uuid: id } });
};

export const StoragePoolRepository = {
  list,
  getById,
  add,
  update,
  deleteById,
};

export default StoragePoolRepository;
