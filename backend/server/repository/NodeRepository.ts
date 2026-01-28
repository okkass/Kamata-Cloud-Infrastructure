import { getPrismaClient } from "./common";
import type { Result } from "@/common/type";
import type { RepositoryError } from "@/common/errors";
import { Prisma } from "@@/generated/client";
import type { Repository } from "./common";

const nodeArgs = {
  select: {
    uuid: true,
    name: true,
    ipAddress: true,
    isAdmin: true,
    createdAt: true,
  },
} satisfies Prisma.NodeFindManyArgs;

export interface NodeInsertProps {
  name: string;
  ipAddress: string;
  isAdmin: boolean;
}

export interface NodeUpdateProps {
  name?: string;
  isAdmin?: boolean;
}

export interface NodeRecord {
  uuid: string;
  name: string;
  ipAddress: string;
  isAdmin: boolean;
  createdAt: Date;
}

const list = async (): Promise<Result<NodeRecord[], RepositoryError>> => {
  try {
    const prisma = getPrismaClient();
    const nodes = await prisma.node.findMany(nodeArgs);
    return { success: true, data: nodes };
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
  uuid: string,
): Promise<Result<NodeRecord | null, RepositoryError>> => {
  try {
    const prisma = getPrismaClient();
    const node = await prisma.node.findUnique({
      where: { uuid },
      ...nodeArgs,
    });
    return { success: true, data: node };
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
  data: NodeInsertProps,
): Promise<Result<NodeRecord, RepositoryError>> => {
  try {
    const prisma = getPrismaClient();
    const newNode = await prisma.node.create({
      data: {
        name: data.name,
        ipAddress: data.ipAddress,
        isAdmin: data.isAdmin,
      },
      ...nodeArgs,
    });
    return { success: true, data: newNode };
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
  uuid: string,
  data: NodeUpdateProps,
): Promise<Result<NodeRecord, RepositoryError>> => {
  try {
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
    return {
      success: true,
      data: result,
    };
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
  uuid: string,
): Promise<Result<void, RepositoryError>> => {
  try {
    const prisma = getPrismaClient();
    await prisma.node.delete({ where: { uuid } });
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

export const NodeRepository: Repository<
  NodeInsertProps,
  NodeUpdateProps,
  NodeRecord
> = {
  list,
  getById,
  create,
  update,
  deleteById,
};

export default NodeRepository;
