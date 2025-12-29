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
import * as argon2 from "argon2";

const mapDbUserToUserResponse = (user: any): UserResponse => {
  return {
    id: user.uuid,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
    lastLoginAt: user.lastLoginAt?.toISOString() ?? "",
    maxCpuCore: user.cpuLimitCores === 0 ? null : user.cpuLimitCores,
    maxMemorySize: user.memoryLimitMb === 0 ? null : user.memoryLimitMb,
    maxStorageSize: user.storageLimitGb === 0 ? null : user.storageLimitGb,
    isAdmin: user.permission?.isAdmin ?? false,
    isImageAdmin: user.permission?.isImageAdmin ?? false,
    isInstanceTypeAdmin: user.permission?.isInstanceTypeAdmin ?? false,
    isVirtualMachineAdmin: user.permission?.isVirtualMachineAdmin ?? false,
    isNetworkAdmin: user.permission?.isNetworkAdmin ?? false,
    isSecurityGroupAdmin: user.permission?.isSecurityGroupAdmin ?? false,
    isNodeAdmin: user.permission?.isNodeAdmin ?? false,
  };
};

export const getUserService = (permission: UserPermissions) => {
  const UserService: ResourceService<
    UserResponse,
    UserCreateRequest,
    UserPatchRequest | UserPutRequest,
    ServiceError
  > = {
    permission,
    list: async (query) => {
      const users = await UserRepository.list();
      const ret: UserResponse[] = users.map((user) => {
        return mapDbUserToUserResponse(user);
      });
      return { success: true, data: ret };
    },
    getById: async (id) => {
      const user = await UserRepository.getById(id);
      if (!user) {
        return {
          success: false,
          error: "NotFound",
        };
      }
      return { success: true, data: mapDbUserToUserResponse(user) };
    },
    create: async (data) => {
      const hash = await argon2.hash(data.password);
      const newUser = await UserRepository.create({
        name: data.name,
        email: data.email,
        passwordHash: hash,
        maxCpuCore: data.maxCpuCore ?? 0,
        maxMemorySizeMb: data.maxMemorySize ?? 0,
        maxStorageSizeGb: data.maxStorageSize ?? 0,
        isAdmin: data.isAdmin ?? false,
        isImageAdmin: data.isImageAdmin ?? false,
        isInstanceTypeAdmin: data.isInstanceTypeAdmin ?? false,
        isVirtualMachineAdmin: data.isVirtualMachineAdmin ?? false,
        isNetworkAdmin: data.isNetworkAdmin ?? false,
        isSecurityGroupAdmin: data.isSecurityGroupAdmin ?? false,
        isNodeAdmin: data.isNodeAdmin ?? false,
      });
      return { success: true, data: mapDbUserToUserResponse(newUser) };
    },
    update: async (id, data) => {
      const user = await UserRepository.getById(id);
      if (!user) {
        return {
          success: false,
          error: "NotFound",
        };
      }
      const updatedUser = await UserRepository.update(id, {
        name: data.name,
        email: data.email,
        maxCpuCore: data.maxCpuCore ?? 0,
        maxMemorySizeMb: data.maxMemorySize ?? 0,
        maxStorageSizeGb: data.maxStorageSize ?? 0,
        isAdmin: data.isAdmin ?? false,
        isImageAdmin: data.isImageAdmin ?? false,
        isInstanceTypeAdmin: data.isInstanceTypeAdmin ?? false,
        isVirtualMachineAdmin: data.isVirtualMachineAdmin ?? false,
        isNetworkAdmin: data.isNetworkAdmin ?? false,
        isSecurityGroupAdmin: data.isSecurityGroupAdmin ?? false,
        isNodeAdmin: data.isNodeAdmin ?? false,
      });
      return { success: true, data: mapDbUserToUserResponse(updatedUser) };
    },
    delete: async (id) => {
      const user = await UserRepository.getById(id);
      if (!user) {
        return {
          success: false,
          error: "NotFound",
        };
      }
      await UserRepository.deleteById(id);
      return { success: true, data: null };
    },
  };
  return UserService;
};
