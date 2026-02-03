import type { ResourceService } from "@/common/service";
import type {
  UserResponse,
  UserCreateRequest,
  UserPatchRequest,
  UserPutRequest,
} from "@app/shared/types";
import { UserPermissions } from "@/types";
import type { ServiceError } from "@/common/errors";
import UserRepository from "@/repository/UserRepository";
import type { UserRecord, PermissionRecord } from "@/repository/UserRepository";
import * as argon2 from "argon2";
import { PrismaClientKnownRequestError } from "@@/generated/internal/prismaNamespace";

// DBのUserRecordをUserResponseに変換するユーティリティ関数
const mapDbUserToUserResponse = (
  user: UserRecord,
  permission: PermissionRecord | null,
): UserResponse => {
  return {
    id: user.uuid,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
    lastLoginAt: user.lastLoginAt?.toISOString() ?? "",
    maxCpuCore: user.cpuLimitCores === 0 ? null : user.cpuLimitCores,
    maxMemorySize:
      user.memoryLimitMb === 0 ? null : user.memoryLimitMb * 1024 ** 2,
    maxStorageSize:
      user.storageLimitGb === 0 ? null : user.storageLimitGb * 1024 ** 3,
    isAdmin: permission?.isAdmin ?? false,
    isImageAdmin: permission?.isImageAdmin ?? false,
    isInstanceTypeAdmin: permission?.isInstanceTypeAdmin ?? false,
    isVirtualMachineAdmin: permission?.isVirtualMachineAdmin ?? false,
    isNetworkAdmin: permission?.isNetworkAdmin ?? false,
    isSecurityGroupAdmin: permission?.isSecurityGroupAdmin ?? false,
    isNodeAdmin: permission?.isNodeAdmin ?? false,
  };
};

// このへんはいじらなくていい
type UserService = ResourceService<
  UserResponse,
  UserCreateRequest,
  UserPatchRequest | UserPutRequest,
  ServiceError
> & {
  updatePassword: (
    id: string,
    currentPassword: string,
    newPassword: string,
  ) => Promise<
    { success: true; data: void } | { success: false; error: ServiceError }
  >;
};

export const getUserService = (permission: UserPermissions | null = null) => {
  const userService: UserService = {
    // 一覧取得
    list: async (query) => {
      // try-catchで囲う(prismaは例外を投げる)
      try {
        const users = await UserRepository.list();
        const ret: UserResponse[] = users.map((user) => {
          return mapDbUserToUserResponse(user, user.permission);
        });
        // 戻り値はResult型で返す
        return { success: true, data: ret };
      } catch (error) {
        return {
          success: false,
          error: { reason: "InternalError", message: "Failed to list users" },
        };
      }
    },
    // UUIDでの取得
    getById: async (id) => {
      // try-catchで囲う(prismaは例外を投げる)
      try {
        const user = await UserRepository.getById(id);
        if (!user) {
          return {
            success: false,
            error: { reason: "NotFound" },
          };
        }
        return {
          success: true,
          data: mapDbUserToUserResponse(user, user.permission),
        };
      } catch (error) {
        return {
          success: false,
          error: { reason: "InternalError", message: "Failed to get user" },
        };
      }
    },
    // ユーザ新規作成
    create: async (data) => {
      // パスワードをハッシュ化
      const hash = await argon2.hash(data.password);
      try {
        const newUser = await UserRepository.create({
          name: data.name,
          email: data.email,
          passwordHash: hash,
          maxCpuCore: data.maxCpuCore ?? 0,
          maxMemorySizeMb:
            data.maxMemorySize === null ? 0 : data.maxMemorySize / 1024 ** 2,
          maxStorageSizeGb:
            data.maxStorageSize === null ? 0 : data.maxStorageSize / 1024 ** 3,
          isAdmin: data.isAdmin ?? false,
          isImageAdmin: data.isImageAdmin ?? false,
          isInstanceTypeAdmin: data.isInstanceTypeAdmin ?? false,
          isVirtualMachineAdmin: data.isVirtualMachineAdmin ?? false,
          isNetworkAdmin: data.isNetworkAdmin ?? false,
          isSecurityGroupAdmin: data.isSecurityGroupAdmin ?? false,
          isNodeAdmin: data.isNodeAdmin ?? false,
        });
        return {
          success: true,
          data: mapDbUserToUserResponse(newUser, newUser.permission),
        };
      } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === "P2002") {
            return {
              success: false,
              error: { reason: "BadRequest", message: "email already exists" },
            };
          }
        }
        return {
          success: false,
          error: { reason: "InternalError", message: "Failed to create user" },
        };
      }
    },
    // ユーザ情報更新
    update: async (id, data) => {
      // try-catchで囲う(prismaは例外を投げる)
      const user = await UserRepository.getById(id);
      if (!user) {
        return {
          success: false,
          error: { reason: "NotFound" },
        };
      }
      const updatedUser = await UserRepository.update(id, {
        name: data.name,
        email: data.email,
        maxCpuCore: data.maxCpuCore ?? 0,
        maxMemorySizeMb:
          data.maxMemorySize === null || data.maxMemorySize === undefined
            ? 0
            : data.maxMemorySize / 1024 ** 2,
        maxStorageSizeGb:
          data.maxStorageSize === null || data.maxStorageSize === undefined
            ? 0
            : data.maxStorageSize / 1024 ** 3,
      });
      const updatedPermission = await UserRepository.updatePermission(id, {
        isAdmin: data.isAdmin,
        isImageAdmin: data.isImageAdmin,
        isInstanceTypeAdmin: data.isInstanceTypeAdmin,
        isVirtualMachineAdmin: data.isVirtualMachineAdmin,
        isNetworkAdmin: data.isNetworkAdmin,
        isSecurityGroupAdmin: data.isSecurityGroupAdmin,
        isNodeAdmin: data.isNodeAdmin,
      });
      return {
        success: true,
        data: mapDbUserToUserResponse(updatedUser, updatedPermission),
      };
    },
    // ユーザ削除
    delete: async (id) => {
      const user = await UserRepository.getById(id);
      if (!user) {
        return {
          success: false,
          error: { reason: "NotFound" },
        };
      }
      await UserRepository.deleteById(id);
      return { success: true, data: undefined };
    },
    updatePassword: async (id, currentPassword, newPassword) => {
      const user = await UserRepository.getById(id);
      if (!user) {
        return {
          success: false,
          error: { reason: "NotFound" },
        };
      }
      const isPasswordValid = await argon2.verify(
        user.credentials!.hashedPassword,
        currentPassword,
      );
      if (!isPasswordValid) {
        return {
          success: false,
          error: {
            reason: "BadRequest",
            message: "Current password is invalid",
          },
        };
      }
      const newHashedPassword = await argon2.hash(newPassword);
      await UserRepository.updatePassword(id, newHashedPassword);
      return { success: true, data: undefined };
    },
  };
  return userService;
};
