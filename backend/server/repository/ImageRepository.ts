import type {
  ImageResponse,
  ImageCreateRequest,
  ImagePatchRequest,
  ImagePutRequest,
} from "@app/shared/types";

import { getPrismaClient, NotFoundError } from "./common";

// PrismaのImage -> ImageResponse へ変換（nodeも含める）
const mapDbImageToImageResponse = (image: any): ImageResponse => {
  return {
    id: image.uuid,
    name: image.name,
    description: image.description ?? undefined,
    createdAt: image.createdAt.toISOString(),
    size: image.size,
    node: {
      id: image.ownNode.uuid,
      name: image.ownNode.name,
      ipAddress: image.ownNode.ipAddress,
      isAdmin: image.ownNode.isAdmin,
      createdAt: image.ownNode.createdAt.toISOString(),
    },
  } as ImageResponse;
};

// 一覧取得
const list = async (): Promise<ImageResponse[]> => {
  const prisma = getPrismaClient();

  const images = await prisma.image.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      uuid: true,
      name: true,
      description: true,
      size: true,
      createdAt: true,
      ownNode: {
        select: {
          uuid: true,
          name: true,
          ipAddress: true,
          isAdmin: true,
          createdAt: true,
        },
      },
    },
  });

  return images.map(mapDbImageToImageResponse);
};

// uuidで取得（無ければnull）
const getById = async (id: string): Promise<ImageResponse | null> => {
  const prisma = getPrismaClient();

  const image = await prisma.image.findUnique({
    where: { uuid: id },
    select: {
      uuid: true,
      name: true,
      description: true,
      size: true,
      createdAt: true,
      ownNode: {
        select: {
          uuid: true,
          name: true,
          ipAddress: true,
          isAdmin: true,
          createdAt: true,
        },
      },
    },
  });

  return image ? mapDbImageToImageResponse(image) : null;
};

// 作成
const create = async (image: ImageCreateRequest): Promise<ImageResponse> => {
  const prisma = getPrismaClient();

  // ImageCreateRequest が nodeId(uuid) を持つ前提で、Node.uuid -> Node.id に変換してつなぐ
  const node = await prisma.node.findUnique({
    where: { uuid: image.nodeId },
    select: { id: true },
  });
  if (!node) {
    throw new NotFoundError("Node not found");
  }

  const created = await prisma.image.create({
    data: {
      name: image.name,
      description: "description" in image ? (image as any).description ?? null : null,
      // いまのモックは size 固定だけど、API側で渡せるなら image.size を使う
      size: (image as any).size ?? 2 * 1024 * 1024 * 1024,
      ownNodeId: node.id,
    },
    select: {
      uuid: true,
      name: true,
      description: true,
      size: true,
      createdAt: true,
      ownNode: {
        select: {
          uuid: true,
          name: true,
          ipAddress: true,
          isAdmin: true,
          createdAt: true,
        },
      },
    },
  });

  return mapDbImageToImageResponse(created);
};

// 更新（Patch/Put）
// 無ければ null を返す（UserRepositoryと同じノリにしたいなら例外でもOK）
const update = async (
  id: string,
  updateFields: ImagePatchRequest | ImagePutRequest,
): Promise<ImageResponse | null> => {
  const prisma = getPrismaClient();

  // Prismaは update で無いと例外なので、先に存在確認する（UserServiceのノリに合わせる）
  const exists = await prisma.image.findUnique({
    where: { uuid: id },
    select: { id: true },
  });
  if (!exists) return null;

  const updated = await prisma.image.update({
    where: { uuid: id },
    data: {
      name: updateFields.name,
      ...(("description" in updateFields)
        ? { description: (updateFields as any).description ?? null }
        : {}),
      // nodeId を更新したい仕様ならここに接続更新を足す（今のモックは更新してないので無し）
    },
    select: {
      uuid: true,
      name: true,
      description: true,
      size: true,
      createdAt: true,
      ownNode: {
        select: {
          uuid: true,
          name: true,
          ipAddress: true,
          isAdmin: true,
          createdAt: true,
        },
      },
    },
  });

  return mapDbImageToImageResponse(updated);
};

// 削除（成功したら true、無ければ false）
const deleteById = async (id: string): Promise<boolean> => {
  const prisma = getPrismaClient();

  const exists = await prisma.image.findUnique({
    where: { uuid: id },
    select: { uuid: true },
  });
  if (!exists) return false;

  await prisma.image.delete({ where: { uuid: id } });
  return true;
};

export const ImageRepository = {
  list,
  getById,
  create,
  update,
  deleteById,
};

export default ImageRepository;
