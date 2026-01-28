import { getPrismaClient } from "./common";
import type { Result } from "@/common/type";
import type { RepositoryError } from "@/common/errors";
import { Prisma } from "@@/generated/client";
import type { Repository } from "./common";

const instanceTypeArgs = {
  select: {
    uuid: true,
    name: true,
    cpuCore: true,
    memorySizeMb: true,
    createdAt: true,
  },
} satisfies Prisma.InstanceTypeFindManyArgs;

const instanceTypeManyArgs = {
  ...instanceTypeArgs,
  orderBy: {
    createdAt: "desc",
  },
} satisfies Prisma.InstanceTypeFindManyArgs;

export interface InstanceTypeInsertProps {
  name: string;
  cpuCore: number;
  memorySizeBytes: number; // 窓口は bytes
}

export interface InstanceTypeUpdateProps {
  name?: string;
  cpuCore?: number;
  memorySizeBytes?: number; // 窓口は bytes
}

export interface InstanceTypeRecord {
  uuid: string;
  name: string;
  cpuCore: number;
  memorySizeBytes: number; // 窓口は bytes
  createdAt: string; // ISO string
}

const toResponse = (row: {
  uuid: string;
  name: string;
  cpuCore: number;
  memorySizeMb: number; // MB
  createdAt: Date;
}): InstanceTypeRecord => {
  return {
    uuid: row.uuid,
    name: row.name,
    cpuCore: row.cpuCore,
    // DBはMB -> 窓口はbytesに変換
    memorySizeBytes: mbToBytes(row.memorySizeMb),
    createdAt: row.createdAt.toISOString(),
  };
};

// ---------------------------------------------
// Unit conversion
// API: bytes
// DB : MB (Int)
// ---------------------------------------------
const BYTES_PER_MB = 1024 * 1024;

const bytesToMb = (bytes: number): number => {
  console.log("bytesToMb:", bytes, bytes / BYTES_PER_MB);
  // DBはInt想定なので切り捨て（必要なら round/ceil に変更）
  return bytes / BYTES_PER_MB;
};

const mbToBytes = (mb: number): number => {
  return mb * BYTES_PER_MB;
};

const list = async (): Promise<
  Result<Array<InstanceTypeRecord>, RepositoryError>
> => {
  try {
    const prisma = getPrismaClient();
    const rows = await prisma.instanceType.findMany(instanceTypeManyArgs);
    const records: InstanceTypeRecord[] = rows.map((row) => toResponse(row));

    return { success: true, data: records };
  } catch (error) {
    return {
      success: false,
      error: {
        reason: "InternalError",
        message: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
};

const getById = async (
  id: string,
): Promise<Result<InstanceTypeRecord | null, RepositoryError>> => {
  try {
    const prisma = getPrismaClient();
    const row = await prisma.instanceType.findUnique({
      where: { uuid: id },
      ...instanceTypeArgs,
    });
    // nullならnullを、存在すれば変換して返す
    const res = row ? toResponse(row) : null;

    return { success: true, data: res };
  } catch (error) {
    return {
      success: false,
      error: {
        reason: "InternalError",
        message: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
};

const create = async (
  instanceType: InstanceTypeInsertProps,
): Promise<Result<InstanceTypeRecord, RepositoryError>> => {
  try {
    const prisma = getPrismaClient();
    const newRow = await prisma.instanceType.create({
      data: {
        name: instanceType.name,
        cpuCore: instanceType.cpuCore,
        // DBへはMBで保存
        memorySizeMb: bytesToMb(instanceType.memorySizeBytes),
      },
      ...instanceTypeArgs,
    });
    return { success: true, data: toResponse(newRow) };
  } catch (error) {
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
  updateFields: InstanceTypeUpdateProps,
): Promise<Result<InstanceTypeRecord, RepositoryError>> => {
  console.log("Updating InstanceType:", id, updateFields);
  try {
    const prisma = getPrismaClient();
    const updatedRow = await prisma.instanceType.update({
      where: { uuid: id },
      data: {
        uuid: id,
        name: updateFields.name,
        cpuCore: updateFields.cpuCore,
        // DBへはMBで保存
        memorySizeMb: updateFields.memorySizeBytes
          ? bytesToMb(updateFields.memorySizeBytes)
          : undefined,
      },
      ...instanceTypeArgs,
    });
    return { success: true, data: toResponse(updatedRow) };
  } catch (error) {
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
    await prisma.instanceType.delete({ where: { uuid: id } });
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: {
        reason: "InternalError",
        message: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
};

export const InstanceTypeRepository: Repository<
  InstanceTypeInsertProps,
  InstanceTypeUpdateProps,
  InstanceTypeRecord
> = {
  list,
  getById,
  create,
  update,
  deleteById,
};

export default InstanceTypeRepository;
