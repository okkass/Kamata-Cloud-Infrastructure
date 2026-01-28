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
  SecurityGroupCreateInput,
  SecurityRuleCreateInput,
  SecurityGroupUpdateInput,
  SecurityRuleUpdateInput,
  PORT_ALL,
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
    ruleType: record.roleType,
    port: record.port === PORT_ALL ? null : record.port,
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
      id: record.user.uuid,
      name: record.user.name,
    },
    rules: record.rules.map(mapRuleRecordToResponse),
    createdAt: record.createdAt.toISOString(),
  };
};

const mapRuleCreateRequestToInput = (
  request: SecurityRuleCreateRequest,
): SecurityRuleCreateInput => {
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
): SecurityGroupCreateInput => {
  return {
    userId,
    name: request.name,
    description: request.description ?? undefined,
    rules: request.rules.map(mapRuleCreateRequestToInput),
  };
};

const mapRuleUpdateRequestToInput = (
  request: SecurityRulePatchRequest | SecurityRulePutRequest,
): SecurityRuleUpdateInput => {
  return {
    name: request.name,
    ruleType: request.ruleType,
    port: request.port === null ? PORT_ALL : request.port,
    protocol: request.protocol,
    targetIp: request.targetIp,
    action: request.action,
  };
};

const mapGroupUpdateRequestToInput = (
  request: SecurityGroupPatchRequest | SecurityGroupPutRequest,
): SecurityGroupUpdateInput => {
  return {
    name: request.name,
    description: request.description ?? undefined,
  };
};

export const getSecurityGroupService = (permission: UserPermissions) => {
  const SecurityGroupService: SecurityGroupService = {
    permission,
    async list(query) {
      try {
        const groups = await SecurityGroupRepository.list();
        return { success: true, data: groups.map(mapGroupRecordToResponse) };
      } catch (error) {
        return { success: false, error: { reason: "InternalError" } };
      }
    },
    async getById(id) {
      try {
        const group = await SecurityGroupRepository.getById(id);
        if (!group) {
          return {
            success: false,
            error: { reason: "NotFound" },
          };
        }
        return { success: true, data: mapGroupRecordToResponse(group) };
      } catch (error) {
        return { success: false, error: { reason: "InternalError" } };
      }
    },
    async create(data) {
      try {
        const newGroup = await SecurityGroupRepository.create(
          mapGroupCreateRequestToInput(permission.id, data),
        );
        return {
          success: true,
          data: mapGroupRecordToResponse(newGroup),
        };
      } catch (error) {
        return { success: false, error: { reason: "InternalError" } };
      }
    },
    async update(id, data) {
      try {
        const updatedGroup = await SecurityGroupRepository.update(
          id,
          mapGroupUpdateRequestToInput(data),
        );
        return {
          success: true,
          data: mapGroupRecordToResponse(updatedGroup),
        };
      } catch (error) {
        return { success: false, error: { reason: "InternalError" } };
      }
    },
    async delete(id) {
      try {
        await SecurityGroupRepository.deleteById(id);
        return { success: true, data: undefined };
      } catch (error) {
        return { success: false, error: { reason: "InternalError" } };
      }
    },
    getSecurityRuleService(sgId) {
      const SecurityRuleService: SecurityRuleService = {
        permission,
        async list(query) {
          try {
            const rules = await SecurityGroupRepository.listRules(sgId);
            return {
              success: true,
              data: rules.map(mapRuleRecordToResponse),
            };
          } catch (error) {
            return { success: false, error: { reason: "InternalError" } };
          }
        },
        async getById(id) {
          try {
            const rule = await SecurityGroupRepository.getRuleById(sgId, id);
            if (!rule) {
              return {
                success: false,
                error: { reason: "NotFound" },
              };
            }
            return {
              success: true,
              data: mapRuleRecordToResponse(rule),
            };
          } catch (error) {
            return { success: false, error: { reason: "InternalError" } };
          }
        },
        async create(data) {
          try {
            const newRule = await SecurityGroupRepository.createRule(
              sgId,
              mapRuleCreateRequestToInput(data),
            );
            return { success: true, data: mapRuleRecordToResponse(newRule) };
          } catch (error) {
            return { success: false, error: { reason: "InternalError" } };
          }
        },
        async update(id, data) {
          try {
            const updatedRule = await SecurityGroupRepository.updateRule(
              sgId,
              id,
              mapRuleUpdateRequestToInput(data),
            );
            return {
              success: true,
              data: mapRuleRecordToResponse(updatedRule),
            };
          } catch (error) {
            return { success: false, error: { reason: "InternalError" } };
          }
        },
        async delete(id) {
          try {
            await SecurityGroupRepository.deleteRule(sgId, id);
            return { success: true, data: undefined };
          } catch (error) {
            return { success: false, error: { reason: "InternalError" } };
          }
        },
      };
      return SecurityRuleService;
    },
  };
  return SecurityGroupService;
};
