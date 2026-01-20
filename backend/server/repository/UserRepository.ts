import { getPrismaClient, NotFoundError } from "./common";

// ユーザを新規作成する際に必要な情報
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

// ユーザを更新する際に使用する情報
export interface UserUpdateProps {
  name?: string;
  email?: string;
  maxCpuCore?: number;
  maxMemorySizeMb?: number;
  maxStorageSizeGb?: number;
}

// ユーザの権限を更新する際に使用する情報
export interface UserPermissionUpdateProps {
  isAdmin?: boolean;
  isImageAdmin?: boolean;
  isInstanceTypeAdmin?: boolean;
  isVirtualMachineAdmin?: boolean;
  isNetworkAdmin?: boolean;
  isSecurityGroupAdmin?: boolean;
  isNodeAdmin?: boolean;
}

// ユーザの権限情報
export interface PermissionRecord {
  isAdmin: boolean;
  isImageAdmin: boolean;
  isInstanceTypeAdmin: boolean;
  isVirtualMachineAdmin: boolean;
  isNetworkAdmin: boolean;
  isSecurityGroupAdmin: boolean;
  isNodeAdmin: boolean;
}

// ユーザ情報の型定義
export interface UserRecord {
  uuid: string;
  name: string;
  email: string;
  createdAt: Date;
  lastLoginAt: Date | null;
  cpuLimitCores: number;
  memoryLimitMb: number;
  storageLimitGb: number;
  permission: PermissionRecord | null;
  credentials?: {
    hashedPassword: string;
  } | null;
}

// 一覧取得
const list = async (): Promise<UserRecord[]> => {
  // prisma clientの取得
  const prisma = getPrismaClient();

  // ユーザ一覧を取得
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

// UUIDでの取得。該当なしだとnullを返す
const getById = async (id: string): Promise<UserRecord | null> => {
  const prisma = getPrismaClient();

  // findUniqueでUUID検索
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
      cpuLimitCores: true,
      memoryLimitMb: true,
      storageLimitGb: true,
      // 権限情報も一緒に取得
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
      // パスワードハッシュも取得
      credentials: {
        select: {
          hashedPassword: true,
        },
      },
    },
  });
  return user;
};

// emailをキーにして取得。該当なしだとnullを返す
const getByEmail = async (email: string): Promise<UserRecord | null> => {
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
      credentials: {
        select: {
          hashedPassword: true,
        },
      },
    },
  });
  return user;
};

// ユーザ新規作成
const create = async (
  userInsertProps: UserInsertProps,
): Promise<UserRecord> => {
  const prisma = getPrismaClient();

  // credentials、 permissionも同時に作成
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

// ユーザ情報更新
const update = async (
  id: string,
  userUpdateProps: UserUpdateProps,
): Promise<UserRecord> => {
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
  return user;
};

// 最終ログイン日時更新 ほかのrepositoryならこれはいらないよ
const updateLastLoginAt = async (id: string): Promise<UserRecord> => {
  const prisma = getPrismaClient();
  const user = await prisma.user.update({
    where: {
      uuid: id,
    },
    data: {
      lastLoginAt: new Date(),
    },
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
  return user;
};

// ユーザ権限更新
const updatePermission = async (
  uuid: string,
  permissionUpdateProps: UserPermissionUpdateProps,
): Promise<PermissionRecord> => {
  const prisma = getPrismaClient();
  // uuidからuid引っ張ってくる
  const user = await prisma.user.findUnique({
    where: {
      uuid: uuid,
    },
    select: {
      id: true,
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

// パスワード更新　これもserviceでやるべきかも
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

// uuidでユーザ削除
const deleteById = async (id: string): Promise<UserRecord> => {
  const prisma = getPrismaClient();

  const result = await prisma.user.delete({
    where: {
      uuid: id,
    },
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
  return result;
};

// エクスポート
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
