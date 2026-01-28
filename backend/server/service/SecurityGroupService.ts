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
  getSecurityRuleService: (sgId: string) => SecurityRuleService;
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
    permission,
    list: async (query) => {
      const result = await SecurityGroupRepository.list();
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
      const result = await SecurityGroupRepository.deleteById(id);
      if (!result.success) {
        if (result.error.reason === "NotFound") {
          return { success: false, error: { reason: "NotFound" } };
        }
        return { success: false, error: { reason: "InternalError" } };
      }
      return { success: true, data: undefined };
    },
    getSecurityRuleService(sgId) {
      const SecurityRuleService: SecurityRuleService = {
        permission,
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
