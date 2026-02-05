import { getPrismaClient } from "./common";
import { Prisma } from "@@/generated/client";
import type { Result } from "@/common/type";
import type { RepositoryError } from "@/common/errors";
import type { Repository } from "./common";
import { PrismaClientKnownRequestError } from "@@/generated/internal/prismaNamespace";
import { Inet4 } from "@/utils/inetutil";

const subnetArgs = {
  select: {
    uuid: true,
    name: true,
    cidr: true,
    createdAt: true,
    virtualNetwork: {
      select: {
        uuid: true,
        name: true,
        cidr: true,
        createdAt: true,
      },
    },
  },
} satisfies Prisma.SubnetFindManyArgs;

const virtualNetworkArgs = {
  select: {
    uuid: true,
    name: true,
    cidr: true,
    createdAt: true,
    subnets: subnetArgs,
    user: {
      select: {
        uuid: true,
        name: true,
      },
    },
  },
} satisfies Prisma.VirtualNetworkFindManyArgs;

export type SubnetInsertProps = {
  name: string;
  cidr: string;
};
export type SubnetRecord = {
  id: string;
  name: string;
  cidr: Inet4;
  createdAt: Date;
  owner?: {
    id: string;
    name: string;
    cidr: Inet4;
    createdAt: Date;
  };
};
export type SubnetUpdateProps = {
  name?: string;
  cidr?: string;
};

export type VirtualNetworkInsertProps = {
  name: string;
  cidr: string;
  userId: string;
  initialSubnets: SubnetInsertProps[];
};
export type VirtualNetworkRecord = {
  id: string;
  name: string;
  cidr: Inet4;
  createdAt: Date;
  subnets: SubnetRecord[];
  owner: {
    id: string;
    name: string;
  };
};
export type VirtualNetworkUpdateProps = {
  name?: string;
};

const toRecordSubnet = (
  row: Prisma.SubnetGetPayload<typeof subnetArgs>,
): SubnetRecord => {
  return {
    id: row.uuid,
    name: row.name,
    cidr: parseCidr(row.cidr)!,
    createdAt: row.createdAt,
    owner: {
      id: row.virtualNetwork.uuid,
      name: row.virtualNetwork.name,
      cidr: parseCidr(row.virtualNetwork.cidr)!,
      createdAt: row.virtualNetwork.createdAt,
    },
  };
};

const toRecordVirtualNetwork = (
  row: Prisma.VirtualNetworkGetPayload<typeof virtualNetworkArgs>,
): VirtualNetworkRecord => {
  return {
    id: row.uuid,
    name: row.name,
    cidr: parseCidr(row.cidr)!,
    createdAt: row.createdAt,
    subnets: row.subnets.map(toRecordSubnet),
    owner: {
      id: row.user.uuid,
      name: row.user.name,
    },
  };
};

const list = async (
  userUuid?: string,
): Promise<Result<VirtualNetworkRecord[], RepositoryError>> => {
  try {
    // 仮想ネットワーク一覧を取得
    const prisma = getPrismaClient();

    // userUuidがある場合、まずはuserIdを取得する
    let userId: bigint | undefined = undefined;
    if (userUuid) {
      const user = await prisma.user.findUnique({
        where: { uuid: userUuid },
        select: { id: true },
      });
      // userIdが見つからなかった場合、エラーを投げる
      if (!user) {
        throw new Error("User not found");
      }
      userId = user.id;
    }
    const whereClause = userId ? { userId: userId } : {};
    const vnets = await prisma.virtualNetwork.findMany({
      ...virtualNetworkArgs,
      where: whereClause,
    });
    return {
      success: true,
      data: vnets.map(toRecordVirtualNetwork),
    };
  } catch (error) {
    return {
      success: false,
      error: {
        reason: "InternalError",
        message: (error as Error).message,
      },
    };
  }
};

const getById = async (
  id: string,
): Promise<Result<VirtualNetworkRecord | null, RepositoryError>> => {
  try {
    const prisma = getPrismaClient();
    const vnet = await prisma.virtualNetwork.findUnique({
      ...virtualNetworkArgs,
      where: { uuid: id },
    });
    return {
      success: true,
      data: vnet ? toRecordVirtualNetwork(vnet) : null,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        reason: "InternalError",
        message: (error as Error).message,
      },
    };
  }
};

const create = async (
  data: VirtualNetworkInsertProps,
): Promise<Result<VirtualNetworkRecord, RepositoryError>> => {
  try {
    const prisma = getPrismaClient();
    const newNetwork = await prisma.virtualNetwork.create({
      data: {
        name: data.name,
        cidr: data.cidr,
        user: {
          connect: { uuid: data.userId },
        },
        subnets: {
          create: data.initialSubnets.map((subnet) => ({
            name: subnet.name,
            cidr: subnet.cidr,
          })),
        },
      },
      ...virtualNetworkArgs,
    });
    return {
      success: true,
      data: toRecordVirtualNetwork(newNetwork),
    };
  } catch (error) {
    return {
      success: false,
      error: {
        reason: "InternalError",
        message: (error as Error).message,
      },
    };
  }
};

const update = async (
  id: string,
  updateFields: VirtualNetworkUpdateProps,
): Promise<Result<VirtualNetworkRecord, RepositoryError>> => {
  try {
    const prisma = getPrismaClient();
    const updated = await prisma.virtualNetwork.update({
      where: { uuid: id },
      data: {
        name: updateFields.name,
      },
      ...virtualNetworkArgs,
    });
    return {
      success: true,
      data: toRecordVirtualNetwork(updated),
    };
  } catch (error) {
    return {
      success: false,
      error: {
        reason: "InternalError",
        message: (error as Error).message,
      },
    };
  }
};

const deleteById = async (
  id: string,
): Promise<Result<void, RepositoryError>> => {
  try {
    const prisma = getPrismaClient();
    await prisma.virtualNetwork.delete({
      where: { uuid: id },
    });
    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        reason: "InternalError",
        message: (error as Error).message,
      },
    };
  }
};

const listSubnets = async (
  vnetId: string,
): Promise<Result<SubnetRecord[], RepositoryError>> => {
  try {
    const prisma = getPrismaClient();
    // まずはvnetのid(bigint)を取得する
    const vnet = await prisma.virtualNetwork.findUnique({
      where: { uuid: vnetId },
      select: { id: true },
    });
    if (!vnet) {
      return {
        success: false,
        error: {
          reason: "NotFound",
          message: "Virtual network not found",
        },
      };
    }
    const subnets = await prisma.subnet.findMany({
      ...subnetArgs,
      where: { virtualNetworkId: vnet.id },
    });
    return {
      success: true,
      data: subnets.map(toRecordSubnet),
    };
  } catch (error) {
    return {
      success: false,
      error: {
        reason: "InternalError",
        message: (error as Error).message,
      },
    };
  }
};

const getSubnet = async (
  vnetId: string,
  subnetId: string,
): Promise<Result<SubnetRecord | null, RepositoryError>> => {
  try {
    const prisma = getPrismaClient();
    const vnet = await prisma.virtualNetwork.findUnique({
      where: { uuid: vnetId },
      select: { id: true },
    });
    if (!vnet) {
      return {
        success: false,
        error: {
          reason: "NotFound",
          message: "Virtual network not found",
        },
      };
    }
    const subnet = await prisma.subnet.findUnique({
      where: {
        virtualNetworkId: vnet.id,
        uuid: subnetId,
      },
      ...subnetArgs,
    });
    return {
      success: true,
      data: subnet ? toRecordSubnet(subnet) : null,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        reason: "InternalError",
        message: (error as Error).message,
      },
    };
  }
};

const createSubnet = async (
  vnetId: string,
  props: SubnetInsertProps,
): Promise<Result<SubnetRecord, RepositoryError>> => {
  try {
    const prisma = getPrismaClient();
    const vnet = await prisma.virtualNetwork.findUnique({
      where: { uuid: vnetId },
      select: { id: true },
    });
    if (!vnet) {
      return {
        success: false,
        error: {
          reason: "NotFound",
          message: "Virtual network not found",
        },
      };
    }
    const newSubnet = await prisma.subnet.create({
      data: {
        name: props.name,
        cidr: props.cidr,
        virtualNetwork: {
          connect: { id: vnet.id },
        },
      },
      ...subnetArgs,
    });
    return {
      success: true,
      data: toRecordSubnet(newSubnet),
    };
  } catch (error) {
    return {
      success: false,
      error: {
        reason: "InternalError",
        message: (error as Error).message,
      },
    };
  }
};

const updateSubnet = async (
  vnetId: string,
  subnetId: string,
  props: SubnetUpdateProps,
): Promise<Result<SubnetRecord, RepositoryError>> => {
  try {
    const prisma = getPrismaClient();
    const vnet = await prisma.virtualNetwork.findUnique({
      where: { uuid: vnetId },
      select: { id: true },
    });
    if (!vnet) {
      return {
        success: false,
        error: {
          reason: "NotFound",
          message: "Virtual network not found",
        },
      };
    }
    const target = await prisma.subnet.findUnique({
      where: {
        virtualNetworkId: vnet.id,
        uuid: subnetId,
      },
      select: { id: true },
    });
    if (!target) {
      return {
        success: false,
        error: {
          reason: "NotFound",
          message: "Subnet not found",
        },
      };
    }
    const updated = await prisma.subnet.update({
      where: { id: target.id },
      data: {
        name: props.name,
        cidr: props.cidr,
      },
      ...subnetArgs,
    });
    return {
      success: true,
      data: toRecordSubnet(updated),
    };
  } catch (error) {
    return {
      success: false,
      error: {
        reason: "InternalError",
        message: (error as Error).message,
      },
    };
  }
};

const deleteSubnet = async (
  vnetId: string,
  subnetId: string,
): Promise<Result<void, RepositoryError>> => {
  try {
    const prisma = getPrismaClient();
    const vnet = await prisma.virtualNetwork.findUnique({
      where: { uuid: vnetId },
      select: { id: true },
    });
    if (!vnet) {
      return {
        success: false,
        error: {
          reason: "NotFound",
          message: "Virtual network not found",
        },
      };
    }
    const target = await prisma.subnet.findUnique({
      where: {
        virtualNetworkId: vnet.id,
        uuid: subnetId,
      },
      select: { id: true },
    });
    if (!target) {
      return {
        success: false,
        error: {
          reason: "NotFound",
          message: "Subnet not found",
        },
      };
    }
    await prisma.subnet.delete({
      where: { id: target.id },
    });
    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        reason: "InternalError",
        message: (error as Error).message,
      },
    };
  }
};

type VirtualNetworkRepositoryType = Repository<
  VirtualNetworkInsertProps,
  VirtualNetworkUpdateProps,
  VirtualNetworkRecord
> & {
  listSubnets: (
    vnetId: string,
  ) => Promise<Result<SubnetRecord[], RepositoryError>>;
  getSubnet: (
    vnetId: string,
    subnetId: string,
  ) => Promise<Result<SubnetRecord | null, RepositoryError>>;
  createSubnet: (
    vnetId: string,
    props: SubnetInsertProps,
  ) => Promise<Result<SubnetRecord, RepositoryError>>;
  updateSubnet: (
    vnetId: string,
    subnetId: string,
    props: SubnetUpdateProps,
  ) => Promise<Result<SubnetRecord | null, RepositoryError>>;
  deleteSubnet: (
    vnetId: string,
    subnetId: string,
  ) => Promise<Result<void, RepositoryError>>;
};

export const VirtualNetworkRepository: VirtualNetworkRepositoryType = {
  list,
  getById,
  create,
  update,
  deleteById,
  listSubnets,
  getSubnet,
  createSubnet,
  updateSubnet,
  deleteSubnet,
};

export default VirtualNetworkRepository;
