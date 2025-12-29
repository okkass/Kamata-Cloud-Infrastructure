import { getPrismaClient } from "./common";

export interface UserInsertProps {
  name: string;
  email: string;
  passwordHash: string;
  maxCpuCore: number;
  maxMemorySizeMb: number;
  maxStorageSizeGb: number;
  isAdmin: boolean;
  isImageAdmin: boolean;
  isInstanceTypeAdmin: boolean;
  isVirtualMachineAdmin: boolean;
  isNetworkAdmin: boolean;
  isSecurityGroupAdmin: boolean;
  isNodeAdmin: boolean;
}

export interface UserUpdateProps {
  name?: string;
  email?: string;
  maxCpuCore?: number;
  maxMemorySizeMb?: number;
  maxStorageSizeGb?: number;
  isAdmin?: boolean;
  isImageAdmin?: boolean;
  isInstanceTypeAdmin?: boolean;
  isVirtualMachineAdmin?: boolean;
  isNetworkAdmin?: boolean;
  isSecurityGroupAdmin?: boolean;
  isNodeAdmin?: boolean;
}

const list = async () => {
  const prisma = getPrismaClient();

  const users = await prisma.user.findMany({
    select: {
      uuid: true,
      name: true,
      email: true,
      createdAt: true,
      lastLoginAt: true,
      cpuLimitCores: true,
      memoryLimitMb: true,
      storageLimitGb: true,
      permission: {
        select: {
          isAdmin: true,
          isImageAdmin: true,
          isInstanceTypeAdmin: true,
          isVirtualMachineAdmin: true,
          isNetworkAdmin: true,
          isSecurityGroupAdmin: true,
          isNodeAdmin: true,
        },
      },
    },
  });
  return users;
};

const getById = async (id: string) => {
  const prisma = getPrismaClient();

  const user = await prisma.user.findUnique({
    where: {
      uuid: id,
    },
    select: {
      uuid: true,
      name: true,
      email: true,
      createdAt: true,
      lastLoginAt: true,
      permission: {
        select: {
          isAdmin: true,
          isImageAdmin: true,
          isInstanceTypeAdmin: true,
          isVirtualMachineAdmin: true,
          isNetworkAdmin: true,
          isSecurityGroupAdmin: true,
          isNodeAdmin: true,
        },
      },
    },
  });
  return user;
};

const create = async (userInsertProps: UserInsertProps) => {
  const prisma = getPrismaClient();

  const user = await prisma.user.create({
    data: {
      name: userInsertProps.name,
      email: userInsertProps.email,
      cpuLimitCores: userInsertProps.maxCpuCore,
      memoryLimitMb: userInsertProps.maxMemorySizeMb,
      storageLimitGb: userInsertProps.maxStorageSizeGb,
      credentials: {
        create: {
          hashedPassword: userInsertProps.passwordHash,
        },
      },
      permission: {
        create: {
          isAdmin: userInsertProps.isAdmin,
          isImageAdmin: userInsertProps.isImageAdmin,
          isInstanceTypeAdmin: userInsertProps.isInstanceTypeAdmin,
          isVirtualMachineAdmin: userInsertProps.isVirtualMachineAdmin,
          isNetworkAdmin: userInsertProps.isNetworkAdmin,
          isSecurityGroupAdmin: userInsertProps.isSecurityGroupAdmin,
          isNodeAdmin: userInsertProps.isNodeAdmin,
        },
      },
    },
    include: {
      credentials: true,
      permission: true,
    },
  });
  return user;
};

const update = async (id: string, userUpdateProps: UserUpdateProps) => {
  const prisma = getPrismaClient();
  const user = await prisma.user.update({
    where: {
      uuid: id,
    },
    data: {
      name: userUpdateProps.name,
      email: userUpdateProps.email,
      cpuLimitCores: userUpdateProps.maxCpuCore,
      memoryLimitMb: userUpdateProps.maxMemorySizeMb,
      storageLimitGb: userUpdateProps.maxStorageSizeGb,
      permission: {
        update: {
          isAdmin: userUpdateProps.isAdmin,
          isImageAdmin: userUpdateProps.isImageAdmin,
          isInstanceTypeAdmin: userUpdateProps.isInstanceTypeAdmin,
          isVirtualMachineAdmin: userUpdateProps.isVirtualMachineAdmin,
          isNetworkAdmin: userUpdateProps.isNetworkAdmin,
          isSecurityGroupAdmin: userUpdateProps.isSecurityGroupAdmin,
          isNodeAdmin: userUpdateProps.isNodeAdmin,
        },
      },
    },
  });
  return user;
};

const deleteById = async (id: string) => {
  const prisma = getPrismaClient();

  const result = await prisma.user.delete({
    where: {
      uuid: id,
    },
  });
  return result;
};

export const UserRepository = {
  list,
  getById,
  create,
  update,
  deleteById,
};

export default UserRepository;
