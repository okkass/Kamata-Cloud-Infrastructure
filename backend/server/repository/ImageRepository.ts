import { getPrismaClient } from "./common";
import { Prisma } from "@@/generated/client";
import { PrismaClientKnownRequestError } from "@@/generated/internal/prismaNamespace";

import type { Result } from "@/common/type";
import type { Repository } from "./common";
import type { RepositoryError } from "@/common/errors";

// Nodeの情報はuuidだけ渡す。ほかはService叩いてね
const imageArgs = {
  select: {
    uuid: true,
    name: true,
    description: true,
    sizeMb: true,
    createdAt: true,
    ownPool: {
      select: { uuid: true },
    },
  },
} satisfies Prisma.ImageFindManyArgs;

export type ImageInsertProps = {
  name: string;
  description?: string;
  sizeBytes: number;
  poolId: string; // Poolのuuid
};

export type ImageUpdateProps = {
  name?: string;
  description?: string;
};

export type ImageRecord = {
  uuid: string;
  name: string;
  description?: string;
  sizeBytes: number;
  createdAt: Date;
  ownPoolUuid: string;
};

// PrismaのImage -> ImageRecord へ変換(nodeはuuidのみ)
const mapDbImageToImageRecord = (
  image: Prisma.ImageGetPayload<typeof imageArgs>,
): ImageRecord => {
  return {
    uuid: image.uuid,
    name: image.name,
    description: image.description ?? undefined,
    createdAt: image.createdAt,
    sizeBytes: mbToBytes(image.sizeMb),
    ownPoolUuid: image.ownPool.uuid,
  };
};

// 一覧取得
const list = async (): Promise<Result<ImageRecord[], RepositoryError>> => {
  const prisma = getPrismaClient();

  try {
    const images = await prisma.image.findMany({
      ...imageArgs,
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: images.map(mapDbImageToImageRecord) };
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

// uuidで取得（無ければnull）
const getById = async (
  id: string,
): Promise<Result<ImageRecord | null, RepositoryError>> => {
  const prisma = getPrismaClient();

  const image = await prisma.image.findUnique({
    where: { uuid: id },
    ...imageArgs,
  });

  return image
    ? { success: true, data: mapDbImageToImageRecord(image) }
    : { success: true, data: null };
};

// 作成
const create = async (
  image: ImageInsertProps,
): Promise<Result<ImageRecord, RepositoryError>> => {
  const prisma = getPrismaClient();

  try {
    // poolId から内部IDを取得
    const pool = await prisma.storagePool.findUnique({
      where: { uuid: image.poolId },
      select: { id: true },
    });
    if (!pool) {
      return {
        success: false,
        error: { reason: "BadRequest", message: "Pool not found" },
      };
    }

    const newImage = await prisma.image.create({
      data: {
        name: image.name,
        description: image.description ?? null,
        sizeMb: bytesToMb(image.sizeBytes),
        ownPoolId: pool.id,
      },
      ...imageArgs,
    });

    return { success: true, data: mapDbImageToImageRecord(newImage) };
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

// 更新（Patch/Put）
// 無ければ 失敗 を返す
const update = async (
  id: string,
  updateFields: ImageUpdateProps,
): Promise<Result<ImageRecord, RepositoryError>> => {
  const prisma = getPrismaClient();

  try {
    const updated = await prisma.image.update({
      where: { uuid: id },
      data: {
        name: updateFields.name,
        description: updateFields.description,
      },
      ...imageArgs,
    });
    return { success: true, data: mapDbImageToImageRecord(updated) };
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

// 削除（成功したら true、無ければ false）
const deleteById = async (
  id: string,
): Promise<Result<void, RepositoryError>> => {
  const prisma = getPrismaClient();

  try {
    await prisma.image.delete({ where: { uuid: id } });
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

export const ImageRepository: Repository<
  ImageInsertProps,
  ImageUpdateProps,
  ImageRecord
> = {
  list,
  getById,
  create,
  update,
  deleteById,
};

export default ImageRepository;
