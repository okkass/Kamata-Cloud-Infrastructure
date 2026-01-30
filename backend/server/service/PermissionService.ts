import type { UserPermissions } from "@/types";
import UserRepository from "@/repository/UserRepository";
import SecurityGroupRepository from "@/repository/SecurityGroupRepository";

// Prismaから最新の権限情報に応じてユーザーの権限を確認するサービス
// 対象リソースのIDを取得することで、特定のリソースに対する権限を確認できるようにする
// ストレージとかはそもそもユーザの持ち物じゃないので、リソースIDは不要
export type PermissionService = {
  hasImageAdminPermission(permissions: UserPermissions): Promise<boolean>;
  hasInstanceTypeAdminPermission(
    permissions: UserPermissions,
  ): Promise<boolean>;
  hasNodeAdminPermission(permissions: UserPermissions): Promise<boolean>;
  hasVirtualMachineAdminPermission(
    permissions: UserPermissions,
    resourceId?: string,
  ): Promise<boolean>;
  hasNetworkAdminPermission(
    permissions: UserPermissions,
    resourceId?: string,
  ): Promise<boolean>;
  hasSecurityGroupAdminPermission(
    permissions: UserPermissions,
    resourceId?: string,
  ): Promise<boolean>;
  hasStoragePoolAdminPermission(permissions: UserPermissions): Promise<boolean>;
  hasUserAdminPermission(permissions: UserPermissions): Promise<boolean>;
};

const checkPermission = async (
  permissions: UserPermissions,
  initialCheck: boolean,
  dbcheck: (user: any) => boolean,
): Promise<boolean> => {
  if (!initialCheck) {
    return false;
  }
  const user = await UserRepository.getById(permissions.id);
  if (!user) {
    return false;
  }
  return dbcheck(user);
};

export const getPermissionService = (): PermissionService => {
  return {
    hasImageAdminPermission: async (
      permissions: UserPermissions,
    ): Promise<boolean> => {
      return await checkPermission(
        permissions,
        permissions.isAdmin || permissions.isImageAdmin,
        (user) =>
          (user.permission?.isAdmin ?? false) ||
          (user.permission?.isImageAdmin ?? false),
      );
    },
    hasInstanceTypeAdminPermission: async (
      permissions: UserPermissions,
    ): Promise<boolean> => {
      return await checkPermission(
        permissions,
        permissions.isAdmin || permissions.isInstanceTypeAdmin,
        (user) =>
          (user.permission?.isAdmin ?? false) ||
          (user.permission?.isInstanceTypeAdmin ?? false),
      );
    },
    hasNodeAdminPermission: async (
      permissions: UserPermissions,
    ): Promise<boolean> => {
      return await checkPermission(
        permissions,
        permissions.isAdmin || permissions.isNodeAdmin,
        (user) =>
          (user.permission?.isAdmin ?? false) ||
          (user.permission?.isNodeAdmin ?? false),
      );
    },
    hasVirtualMachineAdminPermission: async (
      permissions: UserPermissions,
      resourceId?: string,
    ): Promise<boolean> => {
      const checkAdmin = await checkPermission(
        permissions,
        permissions.isAdmin || permissions.isVirtualMachineAdmin,
        (user) =>
          (user.permission?.isAdmin ?? false) ||
          (user.permission?.isVirtualMachineAdmin ?? false),
      );

      // TODO: resourceIdからリソースを取得、所有者チェックを実装
      const checkOwner = false;

      return checkAdmin || checkOwner;
    },
    hasNetworkAdminPermission: async (
      permissions: UserPermissions,
      resourceId?: string,
    ): Promise<boolean> => {
      const checkAdmin = await checkPermission(
        permissions,
        permissions.isAdmin || permissions.isNetworkAdmin,
        (user) =>
          (user.permission?.isAdmin ?? false) ||
          (user.permission?.isNetworkAdmin ?? false),
      );

      // TODO: resourceIdからリソースを取得、所有者チェックを実装
      const checkOwner = false;

      return checkAdmin || checkOwner;
    },
    hasSecurityGroupAdminPermission: async (
      permissions: UserPermissions,
      resourceId?: string,
    ): Promise<boolean> => {
      const checkAdmin = await checkPermission(
        permissions,
        permissions.isAdmin || permissions.isSecurityGroupAdmin,
        (user) =>
          (user.permission?.isAdmin ?? false) ||
          (user.permission?.isSecurityGroupAdmin ?? false),
      );

      const sg = await SecurityGroupRepository.getById(resourceId ?? "");
      let checkOwner = false;
      if (sg && sg.success && sg.data) {
        // 所有者チェック
        checkOwner = sg.data.owner.uuid === permissions.id;
      }

      return checkAdmin || checkOwner;
    },
    hasStoragePoolAdminPermission: async (
      permissions: UserPermissions,
    ): Promise<boolean> => {
      const check = await checkPermission(
        permissions,
        permissions.isAdmin,
        (user) => user.permission?.isAdmin ?? false,
      );
      return check;
    },
    hasUserAdminPermission: async (
      permissions: UserPermissions,
    ): Promise<boolean> => {
      const check = await checkPermission(
        permissions,
        permissions.isAdmin,
        (user) => user.permission?.isAdmin ?? false,
      );
      return check;
    },
  };
};
