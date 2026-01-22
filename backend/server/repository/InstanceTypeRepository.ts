import type {
  InstanceTypeResponse,
  InstanceTypePatchRequest,
  InstanceTypePutRequest,
  InstanceTypeCreateRequest,
} from "@app/shared/types";
import { getPrismaClient } from "./common";

// ---------------------------------------------
// Unit conversion
// API: bytes
// DB : MB (Int)
// ---------------------------------------------
const BYTES_PER_MB = 1024 * 1024;

const bytesToMb = (bytes: number): number => {
  // DBはInt想定なので切り捨て（必要なら round/ceil に変更）
  return Math.floor(bytes / BYTES_PER_MB);
};

const mbToBytes = (mb: number): number => {
  return mb * BYTES_PER_MB;
};

const toResponse = (row: {
  uuid: string;
  name: string;
  createdAt: Date;
  cpuCore: number;
  memorySizeMb: number; // DB上は "MB"
}): InstanceTypeResponse => ({
  id: row.uuid,
  name: row.name,
  createdAt: row.createdAt.toISOString(),
  cpuCore: row.cpuCore,
  // DB(MB) -> API(bytes)
  memorySize: mbToBytes(row.memorySizeMb),
});

const list = async (): Promise<Array<InstanceTypeResponse>> => {
  const prisma = getPrismaClient();
  const rows = await prisma.instanceType.findMany({
    select: {
      uuid: true,
      name: true,
      createdAt: true,
      cpuCore: true,
      memorySizeMb: true, // MB
    },
    orderBy: { createdAt: "desc" },
  });

  return rows.map(toResponse);
};

const getById = async (
  id: string,
): Promise<InstanceTypeResponse | undefined> => {
  const prisma = getPrismaClient();
  const row = await prisma.instanceType.findUnique({
    where: { uuid: id },
    select: {
      uuid: true,
      name: true,
      createdAt: true,
      cpuCore: true,
      memorySizeMb: true, // MB
    },
  });

  if (!row) return undefined;
  return toResponse(row);
};

const create = async (
  instanceType: InstanceTypeCreateRequest,
): Promise<InstanceTypeResponse | undefined> => {
  // 最低限のバリデーション（ServiceのBadRequest分岐を活かす）
  if (!instanceType.name?.trim()) return undefined;
  if (instanceType.cpuCore <= 0) return undefined;
  if (instanceType.memorySize <= 0) return undefined;

  const prisma = getPrismaClient();

  // bytes -> MB
  const memorySizeMb = bytesToMb(instanceType.memorySize);
  if (memorySizeMb <= 0) return undefined;

  try {
    const row = await prisma.instanceType.create({
      data: {
        name: instanceType.name.trim(),
        cpuCore: instanceType.cpuCore,
        // DBへはMBで保存
        memorySizeMb: memorySizeMb,
        // uuid/createdAt は schema の default(now()/uuid()) に任せる
      },
      select: {
        uuid: true,
        name: true,
        createdAt: true,
        cpuCore: true,
        memorySizeMb: true, // MB
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
  updateFields: InstanceTypePatchRequest | InstanceTypePutRequest,
): Promise<InstanceTypeResponse | undefined> => {
  const prisma = getPrismaClient();

  // 対象チェック
  const exists = await prisma.instanceType.findUnique({
    where: { uuid: id },
    select: { uuid: true },
  });
  if (!exists) return undefined;

  // 来たものだけ更新
  const name = updateFields.name;
  const cpuCore = updateFields.cpuCore;
  const memorySizeBytes = updateFields.memorySize;

  // バリデーション（来た項目だけ）
  if (name !== undefined && !name.trim()) return undefined;
  if (cpuCore !== undefined && cpuCore <= 0) return undefined;
  if (memorySizeBytes !== undefined && memorySizeBytes <= 0) return undefined;

  // bytes -> MB（来ている時だけ）
  const memorySizeMb =
    memorySizeBytes !== undefined ? bytesToMb(memorySizeBytes) : undefined;

  if (memorySizeMb !== undefined && memorySizeMb <= 0) return undefined;

  const row = await prisma.instanceType.update({
    where: { uuid: id },
    data: {
      name: name !== undefined ? name.trim() : undefined,
      cpuCore,
      // DBへはMBで保存
      memorySizeMb: memorySizeMb,
    },
    select: {
      uuid: true,
      name: true,
      createdAt: true,
      cpuCore: true,
      memorySizeMb: true, // MB
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
