import { getPrismaClient } from "./common";
import { Prisma } from "@@/generated/client";
import type { Result } from "@/common/type";
import type { RepositoryError } from "@/common/errors";
import type { Repository } from "./common";
import { PrismaClientKnownRequestError } from "@@/generated/internal/prismaNamespace";

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

const StoragePoolManyArgs = {
  ...StoragePoolArgs,
  orderBy: {
    createdAt: "desc",
  },
} satisfies Prisma.StoragePoolFindManyArgs;

export type StoragePoolRecord = {
  uuid: string;
  name: string;
  hasNetworkAccess: boolean;
  totalSizeBytes: number;
  availableSizeBytes: number;
  createdAt: Date;
  nodeId: string;
};

export type StoragePoolCreateProps = {
  name: string;
  hasNetworkAccess: boolean;
  totalSizeBytes: number;
  nodeId: string;
};

export type StoragePoolUpdateProps = {
  name?: string;
  hasNetworkAccess?: boolean;
};

const toRecord = (
  data: Prisma.StoragePoolGetPayload<typeof StoragePoolArgs>,
): StoragePoolRecord => {
  return {
    uuid: data.uuid,
    name: data.name,
    hasNetworkAccess: data.hasNetworkAccess,
    totalSizeBytes: mbToBytes(data.totalSizeMb),
    availableSizeBytes: mbToBytes(data.availableSizeMb),
    createdAt: data.createdAt,
    nodeId: data.node.uuid,
  };
};

const list = async (): Promise<
  Result<StoragePoolRecord[], RepositoryError>
> => {
  try {
    const prisma = getPrismaClient();
    const rows = await prisma.storagePool.findMany(StoragePoolManyArgs);
    return { success: true, data: rows.map(toRecord) };
  } catch (error) {
    return {
      success: false,
      error: {
        reason: "InternalError",
      },
    };
  }
};

const getById = async (
  id: string,
): Promise<Result<StoragePoolRecord | null, RepositoryError>> => {
  try {
    const prisma = getPrismaClient();
    const row = await prisma.storagePool.findUnique({
      where: { uuid: id },
      ...StoragePoolArgs,
    });
    return { success: true, data: row ? toRecord(row) : null };
  } catch (error) {
    return {
      success: false,
      error: {
        reason: "InternalError",
      },
    };
  }
};

const create = async (
  input: StoragePoolCreateProps,
): Promise<Result<StoragePoolRecord, RepositoryError>> => {
  try {
    const prisma = getPrismaClient();
    const res = await prisma.storagePool.create({
      data: {
        name: input.name,
        hasNetworkAccess: input.hasNetworkAccess,
        totalSizeMb: bytesToMb(input.totalSizeBytes),
        availableSizeMb: bytesToMb(input.totalSizeBytes),
        node: {
          connect: { uuid: input.nodeId },
        },
      },
      ...StoragePoolArgs,
    });
    return { success: true, data: toRecord(res) };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return {
          success: false,
          error: {
            reason: "NotFound",
            message: "指定されたノードが存在しません。",
          },
        };
      }
    }
    return {
      success: false,
      error: {
        reason: "InternalError",
        message: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
};

const update = async (
  id: string,
  updateFields: StoragePoolUpdateProps,
): Promise<Result<StoragePoolRecord, RepositoryError>> => {
  try {
    const prisma = getPrismaClient();
    const result = await prisma.storagePool.update({
      where: { uuid: id },
      data: {
        name: updateFields.name,
        hasNetworkAccess: updateFields.hasNetworkAccess,
      },
      ...StoragePoolArgs,
    });
    return { success: true, data: toRecord(result) };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return {
          success: false,
          error: {
            reason: "NotFound",
            message: "指定されたストレージプールが存在しません。",
          },
        };
      }
    }
    return {
      success: false,
      error: {
        reason: "InternalError",
        message: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
};

const deleteById = async (
  id: string,
): Promise<Result<void, RepositoryError>> => {
  try {
    const prisma = getPrismaClient();
    await prisma.storagePool.delete({ where: { uuid: id } });
    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return {
          success: false,
          error: {
            reason: "NotFound",
            message: "指定されたストレージプールが存在しません。",
          },
        };
      }
    }
    return {
      success: false,
      error: {
        reason: "InternalError",
        message: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
};

export const StoragePoolRepository: Repository<
  StoragePoolCreateProps,
  StoragePoolUpdateProps,
  StoragePoolRecord
> = {
  list,
  getById,
  create,
  update,
  deleteById,
};

export default StoragePoolRepository;
