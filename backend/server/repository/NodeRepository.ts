import { getPrismaClient } from "./common";

export interface NodeInsertProps {
  name: string;
  ipAddress: string;
  isAdmin: boolean;
}

export interface NodeUpdateProps {
  name?: string;
  isAdmin?: boolean;
}

const list = async () => {
  const prisma = getPrismaClient();
  const nodes = await prisma.node.findMany({
    select: {
      uuid: true,
      name: true,
      ipAddress: true,
      isAdmin: true,
      createdAt: true,
    },
  });
  return nodes;
};

const getById = async (uuid: string) => {
  const prisma = getPrismaClient();

  const node = await prisma.node.findUnique({
    where: {
      uuid,
    },
    select: {
      uuid: true,
      name: true,
      ipAddress: true,
      isAdmin: true,
      createdAt: true,
    },
  });

  return node;
};

const create = async (data: NodeInsertProps) => {
  const prisma = getPrismaClient();

  // トランザクションを使用して一貫性を保つ
  const result = await prisma.$transaction(async (tx) => {
    if (data.isAdmin) {
      await tx.node.updateMany({
        where: {
          isAdmin: true,
        },
        data: {
          isAdmin: false,
        },
      });
    }
    const node = await tx.node.create({
      data: {
        name: data.name,
        ipAddress: data.ipAddress,
        isAdmin: data.isAdmin,
      },
      select: {
        uuid: true,
        name: true,
        ipAddress: true,
        isAdmin: true,
        createdAt: true,
      },
    });
    return node;
  });
  return result;
};

const update = async (uuid: string, data: NodeUpdateProps) => {
  const prisma = getPrismaClient();
  // トランザクションを使用して一貫性を保つ
  const result = await prisma.$transaction(async (tx) => {
    // isAdminがtrueの場合、既存のisAdminをfalseに更新する
    if (data.isAdmin) {
      await tx.node.updateMany({
        where: {
          isAdmin: true,
        },
        data: {
          isAdmin: false,
        },
      });
    }
    const node = await prisma.node.update({
      where: {
        uuid,
      },
      data: {
        name: data.name,
        isAdmin: data.isAdmin,
      },
      select: {
        uuid: true,
        name: true,
        ipAddress: true,
        isAdmin: true,
        createdAt: true,
      },
    });
    return node;
  });
  return result;
};

const deleteById = async (uuid: string) => {
  const prisma = getPrismaClient();

  const result = await prisma.node.delete({
    where: { uuid },
  });
  return result;
};

export const NodeRepository = {
  list,
  getById,
  create,
  update,
  deleteById,
};

export default NodeRepository;
