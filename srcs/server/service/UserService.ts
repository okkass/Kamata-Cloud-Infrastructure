import type { ResourceService } from "@@/server/common/service";
import type {
  UserResponse,
  UserCreateRequest,
  UserPatchRequest,
  UserPutRequest,
} from "@@/shared/types";
import { UserPermissions } from "@@/server/types";
import type { ServiceError } from "@@/server/common/errors";
import UserRepository from "@@/server/repository/UserRepository";

export const getUserService = (permission: UserPermissions) => {
  const UserService: ResourceService<
    UserResponse,
    UserCreateRequest,
    UserPatchRequest | UserPutRequest,
    ServiceError
  > = {
    permission,
    list(query?: string) {
      const users = UserRepository.list();
      return { success: true, data: users };
    },
    getById(id) {
      const user = UserRepository.getById(id);
      if (!user) {
        return {
          success: false,
          error: "NotFound",
        };
      }
      return { success: true, data: user };
    },
    create(data) {
      const newUser = UserRepository.create(data);
      if (!newUser) {
        return {
          success: false,
          error: "BadRequest",
        };
      }
      return { success: true, data: newUser };
    },
    update(id, data) {
      const updatedUser = UserRepository.update(id, data);
      if (!updatedUser) {
        return {
          success: false,
          error: "NotFound",
        };
      }
      return { success: true, data: updatedUser };
    },
    delete(id) {
      const deleted = UserRepository.deleteById(id);
      if (!deleted) {
        return {
          success: false,
          error: "NotFound",
        };
      }
      return { success: true, data: null };
    },
  };
  return UserService;
};
