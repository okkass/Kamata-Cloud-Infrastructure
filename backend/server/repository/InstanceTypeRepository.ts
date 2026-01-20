import type {
  InstanceTypeResponse,
  InstanceTypePatchRequest,
  InstanceTypePutRequest,
  InstanceTypeCreateRequest,
} from "@app/shared/types";
import { getPrismaClient } from "./common";

const toResponse = (row: {
  uuid: string;
  name: string;
  createdAt: Date;
  cpuCore: number;
  memorySize: number;
}): InstanceTypeResponse => ({
  id: row.uuid,
  name: row.name,
  createdAt: row.createdAt.toISOString(),
  cpuCore: row.cpuCore,
  memorySize: row.memorySize,
});

const list = async (): Promise<Array<InstanceTypeResponse>> => {
  const prisma = getPrismaClient();
  const rows = await prisma.instanceType.findMany({
    select: {
      uuid: true,
      name: true,
      createdAt: true,
      cpuCore: true,
      memorySize: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return rows.map(toResponse);
};

const getById = async (id: string): Promise<InstanceTypeResponse | undefined> => {
  const prisma = getPrismaClient();
  const row = await prisma.instanceType.findUnique({
    where: { uuid: id },
    select: {
      uuid: true,
      name: true,
      createdAt: true,
      cpuCore: true,
      memorySize: true,
    },
  });

  if (!row) return undefined;
  return toResponse(row);
};

const create = async (
  instanceType: InstanceTypeCreateRequest
): Promise<InstanceTypeResponse | undefined> => {
  // 最低限のバリデーション（ServiceのBadRequest分岐を活かす）
  if (!instanceType.name?.trim()) return undefined;
  if (instanceType.cpuCore <= 0) return undefined;
  if (instanceType.memorySize <= 0) return undefined;

  const prisma = getPrismaClient();

  try {
    const row = await prisma.instanceType.create({
      data: {
        name: instanceType.name.trim(),
        cpuCore: instanceType.cpuCore,
        memorySize: instanceType.memorySize,
        // uuid/createdAt は schema の default(now()/uuid()) に任せる
      },
      select: {
        uuid: true,
        name: true,
        createdAt: true,
        cpuCore: true,
        memorySize: true,
      },
    });

    return toResponse(row);
  } catch {
    // UNIQUE制約なども含めて BadRequest 扱いにしたいなら undefined
    return undefined;
  }
};

const update = async (
  id: string,
  updateFields: InstanceTypePatchRequest | InstanceTypePutRequest
): Promise<InstanceTypeResponse | undefined> => {
  const prisma = getPrismaClient();

  // 対象チェック
  const exists = await prisma.instanceType.findUnique({
    where: { uuid: id },
    select: { uuid: true },
  });
  if (!exists) return undefined;

  // PATCH/PUT 両対応：来たものだけ更新（PUTを厳密全置換にしたければここで必須チェックを追加）
  const name = updateFields.name;
  const cpuCore = updateFields.cpuCore;
  const memorySize = updateFields.memorySize;

  // バリデーション（来た項目だけ）
  if (name !== undefined && !name.trim()) return undefined;
  if (cpuCore !== undefined && cpuCore <= 0) return undefined;
  if (memorySize !== undefined && memorySize <= 0) return undefined;

  const row = await prisma.instanceType.update({
    where: { uuid: id },
    data: {
      name: name !== undefined ? name.trim() : undefined,
      cpuCore,
      memorySize,
    },
    select: {
      uuid: true,
      name: true,
      createdAt: true,
      cpuCore: true,
      memorySize: true,
    },
  });

  return toResponse(row);
};

const deleteById = async (id: string): Promise<boolean> => {
  const prisma = getPrismaClient();
  try {
    await prisma.instanceType.delete({ where: { uuid: id } });
    return true;
  } catch {
    return false;
  }
};

export const InstanceTypeRepository = {
  list,
  getById,
  create,
  update,
  deleteById,
};

export default InstanceTypeRepository;
