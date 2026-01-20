import { UserPermissions } from "@/types";
import UserRepository from "@/repository/UserRepository";

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

export const getPermissionService = (): PermissionService => {
  return {
    hasImageAdminPermission: async (
      permissions: UserPermissions,
    ): Promise<boolean> => {
      const user = await UserRepository.getById(permissions.id);
      if (!user) {
        return false;
      }
      // 管理者またはイメージ管理者であればtrue
      return (
        (user.permission?.isAdmin ?? false) ||
        (user.permission?.isImageAdmin ?? false)
      );
    },
    hasInstanceTypeAdminPermission: async (
      permissions: UserPermissions,
    ): Promise<boolean> => {
      const user = await UserRepository.getById(permissions.id);
      if (!user) {
        return false;
      }
      // 管理者またはインスタンスタイプ管理者であればtrue
      return (
        (user.permission?.isAdmin ?? false) ||
        (user.permission?.isInstanceTypeAdmin ?? false)
      );
    },
    hasNodeAdminPermission: async (
      permissions: UserPermissions,
    ): Promise<boolean> => {
      const user = await UserRepository.getById(permissions.id);
      if (!user) {
        return false;
      }
      // 管理者またはノード管理者であればtrue
      return (
        (user.permission?.isAdmin ?? false) ||
        (user.permission?.isNodeAdmin ?? false)
      );
    },
    hasVirtualMachineAdminPermission: async (
      permissions: UserPermissions,
      resourceId?: string,
    ): Promise<boolean> => {
      const user = await UserRepository.getById(permissions.id);
      if (!user) {
        return false;
      }
      // TODO: resourceIdに基づく追加チェック

      // 管理者または仮想マシン管理者であればtrue
      return (
        (user.permission?.isAdmin ?? false) ||
        (user.permission?.isVirtualMachineAdmin ?? false)
      );
    },
    hasNetworkAdminPermission: async (
      permissions: UserPermissions,
      resourceId?: string,
    ): Promise<boolean> => {
      const user = await UserRepository.getById(permissions.id);
      if (!user) {
        return false;
      }
      // TODO: resourceIdに基づく追加チェック

      // 管理者または仮想ネットワーク管理者であればtrue
      return (
        (user.permission?.isAdmin ?? false) ||
        (user.permission?.isNetworkAdmin ?? false)
      );
    },
    hasSecurityGroupAdminPermission: async (
      permissions: UserPermissions,
      resourceId?: string,
    ): Promise<boolean> => {
      const user = await UserRepository.getById(permissions.id);
      if (!user) {
        return false;
      }
      // TODO: resourceIdに基づく追加チェック

      // 管理者またはセキュリティグループ管理者であればtrue
      return (
        (user.permission?.isAdmin ?? false) ||
        (user.permission?.isSecurityGroupAdmin ?? false)
      );
    },
    hasStoragePoolAdminPermission: async (
      permissions: UserPermissions,
    ): Promise<boolean> => {
      const user = await UserRepository.getById(permissions.id);
      if (!user) {
        return false;
      }
      // 管理者であればtrue
      return user.permission?.isAdmin ?? false;
    },
    hasUserAdminPermission: async (
      permissions: UserPermissions,
    ): Promise<boolean> => {
      const user = await UserRepository.getById(permissions.id);
      if (!user) {
        return false;
      }
      // 管理者であればtrue
      return user.permission?.isAdmin ?? false;
    },
  };
};
