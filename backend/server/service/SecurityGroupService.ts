import { ResourceService } from "@/common/service";
import type {
  SecurityGroupResponse,
  SecurityGroupCreateRequest,
  SecurityGroupPatchRequest,
  SecurityGroupPutRequest,
  SecurityRuleResponse,
  SecurityRuleCreateRequest,
  SecurityRulePatchRequest,
  SecurityRulePutRequest,
} from "@app/shared/types";
import { UserPermissions } from "@/types";
import type { ServiceError } from "@/common/errors";
import {
  SecurityGroupRecord,
  SecurityRuleRecord,
  SecurityGroupCreateProps,
  SecurityRuleCreateProps,
  SecurityGroupUpdateProps,
  SecurityRuleUpdateProps,
} from "@/repository/SecurityGroupRepository";
import SecurityGroupRepository from "@/repository/SecurityGroupRepository";
import { getPermissionService } from "./PermissionService";

type SecurityRuleService = ResourceService<
  SecurityRuleResponse,
  SecurityRuleCreateRequest,
  SecurityRulePatchRequest | SecurityRulePutRequest,
  ServiceError
>;
type SecurityGroupService = ResourceService<
  SecurityGroupResponse,
  SecurityGroupCreateRequest,
  SecurityGroupPatchRequest | SecurityGroupPutRequest,
  ServiceError
> & {
  getSecurityRuleService: (sgId: string) => Promise<SecurityRuleService>;
};

const mapRuleRecordToResponse = (
  record: SecurityRuleRecord,
): SecurityRuleResponse => {
  return {
    id: record.uuid,
    name: record.name,
    ruleType: record.ruleType,
    port: record.port,
    protocol: record.protocol,
    targetIp: record.targetIp,
    action: record.action,
    createdAt: record.createdAt.toISOString(),
  };
};

const mapGroupRecordToResponse = (
  record: SecurityGroupRecord,
): SecurityGroupResponse => {
  return {
    id: record.uuid,
    name: record.name,
    description: record.description ?? undefined,
    owner: {
      id: record.owner.uuid,
      name: record.owner.name,
    },
    rules: record.rules.map(mapRuleRecordToResponse),
    createdAt: record.createdAt.toISOString(),
  };
};

const mapRuleCreateRequestToInput = (
  request: SecurityRuleCreateRequest,
): SecurityRuleCreateProps => {
  return {
    name: request.name,
    ruleType: request.ruleType,
    port: request.port,
    protocol: request.protocol,
    targetIp: request.targetIp,
    action: request.action,
  };
};

const mapGroupCreateRequestToInput = (
  userId: string,
  request: SecurityGroupCreateRequest,
): SecurityGroupCreateProps => {
  return {
    userId,
    name: request.name,
    description: request.description ?? undefined,
    rules: request.rules.map(mapRuleCreateRequestToInput),
  };
};

const mapRuleUpdateRequestToInput = (
  request: SecurityRulePatchRequest | SecurityRulePutRequest,
): SecurityRuleUpdateProps => {
  return {
    name: request.name,
    ruleType: request.ruleType,
    port: request.port,
    protocol: request.protocol,
    targetIp: request.targetIp,
    action: request.action,
  };
};

const mapGroupUpdateRequestToInput = (
  request: SecurityGroupPatchRequest | SecurityGroupPutRequest,
): SecurityGroupUpdateProps => {
  return {
    name: request.name,
    description: request.description ?? undefined,
  };
};

export const getSecurityGroupService = (permission: UserPermissions) => {
  const SecurityGroupService: SecurityGroupService = {
    list: async (query) => {
      let userId: string | undefined = undefined;

      // queryがallなら権限チェック
      if (query === "all") {
        const permissionService = getPermissionService();
        const hasPermission =
          await permissionService.hasSecurityGroupAdminPermission(permission);
        if (!hasPermission) {
          return { success: false, error: { reason: "Forbidden" } };
        }
      } else {
        // 自分のセキュリティグループのみ取得
        userId = permission.id;
      }

      const result = await SecurityGroupRepository.list(userId);
      if (!result.success) {
        return { success: false, error: { reason: "InternalError" } };
      }
      const groups = result.data.map(mapGroupRecordToResponse);
      return { success: true, data: groups };
    },
    getById: async (id) => {
      const result = await SecurityGroupRepository.getById(id);
      if (!result.success) {
        return { success: false, error: { reason: "InternalError" } };
      }
      if (!result.data) {
        return { success: false, error: { reason: "NotFound" } };
      }
      return {
        success: true,
        data: mapGroupRecordToResponse(result.data),
      };
    },
    create: async (data) => {
      const result = await SecurityGroupRepository.create(
        mapGroupCreateRequestToInput(permission.id, data),
      );
      if (!result.success) {
        return { success: false, error: { reason: "InternalError" } };
      }
      return {
        success: true,
        data: mapGroupRecordToResponse(result.data),
      };
    },
    update: async (id, data) => {
      // 権限チェック　管理者か所有者のみ更新可能
      const permissionService = getPermissionService();
      const hasPermission =
        await permissionService.hasSecurityGroupAdminPermission(permission, id);
      if (!hasPermission) {
        return { success: false, error: { reason: "Forbidden" } };
      }

      const result = await SecurityGroupRepository.update(
        id,
        mapGroupUpdateRequestToInput(data),
      );
      if (!result.success) {
        if (result.error.reason === "NotFound") {
          return { success: false, error: { reason: "NotFound" } };
        }
        return { success: false, error: { reason: "InternalError" } };
      }
      return {
        success: true,
        data: mapGroupRecordToResponse(result.data),
      };
    },
    delete: async (id) => {
      // 権限チェック　管理者か所有者のみ削除可能
      const permissionService = getPermissionService();
      const hasPermission =
        await permissionService.hasSecurityGroupAdminPermission(permission, id);
      if (!hasPermission) {
        return { success: false, error: { reason: "Forbidden" } };
      }
      const result = await SecurityGroupRepository.deleteById(id);
      if (!result.success) {
        if (result.error.reason === "NotFound") {
          return { success: false, error: { reason: "NotFound" } };
        }
        return { success: false, error: { reason: "InternalError" } };
      }
      return { success: true, data: undefined };
    },
    getSecurityRuleService: async (sgId) => {
      // 権限チェック
      const permissionService = getPermissionService();
      const hasPermission =
        await permissionService.hasSecurityGroupAdminPermission(
          permission,
          sgId,
        );

      // 権限がない場合は、すべての操作でForbiddenを返すダミーサービスを返す
      if (!hasPermission) {
        return {
          list: async () => {
            return { success: false, error: { reason: "Forbidden" } };
          },
          getById: async () => {
            return { success: false, error: { reason: "Forbidden" } };
          },
          create: async () => {
            return { success: false, error: { reason: "Forbidden" } };
          },
          update: async () => {
            return { success: false, error: { reason: "Forbidden" } };
          },
          delete: async () => {
            return { success: false, error: { reason: "Forbidden" } };
          },
        };
      }

      const SecurityRuleService: SecurityRuleService = {
        list: async (query) => {
          const result = await SecurityGroupRepository.listRules(sgId);
          if (!result.success) {
            return { success: false, error: { reason: "InternalError" } };
          }
          const rules = result.data.map(mapRuleRecordToResponse);
          return { success: true, data: rules };
        },
        getById: async (id) => {
          const result = await SecurityGroupRepository.getRuleById(sgId, id);
          if (!result.success) {
            return { success: false, error: { reason: "InternalError" } };
          }
          if (!result.data) {
            return { success: false, error: { reason: "NotFound" } };
          }
          return {
            success: true,
            data: mapRuleRecordToResponse(result.data),
          };
        },
        create: async (data) => {
          const result = await SecurityGroupRepository.createRule(
            sgId,
            mapRuleCreateRequestToInput(data),
          );
          if (!result.success) {
            return { success: false, error: { reason: "InternalError" } };
          }
          return {
            success: true,
            data: mapRuleRecordToResponse(result.data),
          };
        },
        update: async (id, data) => {
          const result = await SecurityGroupRepository.updateRule(
            sgId,
            id,
            mapRuleUpdateRequestToInput(data),
          );
          if (!result.success) {
            return { success: false, error: { reason: "InternalError" } };
          }
          return {
            success: true,
            data: mapRuleRecordToResponse(result.data),
          };
        },
        delete: async (id) => {
          const result = await SecurityGroupRepository.deleteRule(sgId, id);
          if (!result.success) {
            return { success: false, error: { reason: "InternalError" } };
          }
          return { success: true, data: undefined };
        },
      };
      return SecurityRuleService;
    },
  };
  return SecurityGroupService;
};
