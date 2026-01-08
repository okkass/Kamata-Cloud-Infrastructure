import { getPrismaClient, NotFoundError } from "./common";

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
}

export interface UserPermissionUpdateProps {
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
      credentials: {
        select: {
          hashedPassword: true,
        },
      },
    },
  });
  return user;
};

const getByEmail = async (email: string) => {
  const prisma = getPrismaClient();

  const user = await prisma.user.findUnique({
    where: {
      email: email,
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
      credentials: {
        select: {
          hashedPassword: true,
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
    },
  });
  return user;
};

const updateLastLoginAt = async (id: string) => {
  const prisma = getPrismaClient();
  const user = await prisma.user.update({
    where: {
      uuid: id,
    },
    data: {
      lastLoginAt: new Date(),
    },
  });
  return user;
};

const updatePermission = async (
  uuid: string,
  permissionUpdateProps: UserPermissionUpdateProps
) => {
  const prisma = getPrismaClient();
  // uuidからuid引っ張ってくる
  const user = await prisma.user.findUnique({
    where: {
      uuid: uuid,
    },
    select: {
      id: true,
    },
  });
  if (!user) {
    throw new NotFoundError("User not found");
  }
  const permission = await prisma.permission.update({
    where: {
      id: user.id,
    },
    data: {
      isAdmin: permissionUpdateProps.isAdmin,
      isImageAdmin: permissionUpdateProps.isImageAdmin,
      isInstanceTypeAdmin: permissionUpdateProps.isInstanceTypeAdmin,
      isVirtualMachineAdmin: permissionUpdateProps.isVirtualMachineAdmin,
      isNetworkAdmin: permissionUpdateProps.isNetworkAdmin,
      isSecurityGroupAdmin: permissionUpdateProps.isSecurityGroupAdmin,
      isNodeAdmin: permissionUpdateProps.isNodeAdmin,
    },
  });
  return permission;
};

const updatePassword = async (uuid: string, newPasswordHash: string) => {
  const prisma = getPrismaClient();
  const user = await prisma.user.findUnique({
    where: {
      uuid: uuid,
    },
    select: {
      id: true,
    },
  });
  if (!user) {
    throw new NotFoundError("User not found");
  }
  const credential = await prisma.userCredential.update({
    where: {
      userId: user.id,
    },
    data: {
      hashedPassword: newPasswordHash,
    },
  });
  return credential;
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
  getByEmail,
  create,
  update,
  deleteById,
  updatePermission,
  updatePassword,
  updateLastLoginAt,
};

export default UserRepository;
