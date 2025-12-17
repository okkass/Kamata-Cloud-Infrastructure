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
import SecurityGroupRepository from "@/repository/SecurityGroupRepository";

export const getSecurityGroupService = (permission: UserPermissions) => {
  const SecurityGroupService: ResourceService<
    SecurityGroupResponse,
    SecurityGroupCreateRequest,
    SecurityGroupPatchRequest | SecurityGroupPutRequest,
    ServiceError
  > = {
    permission,
    list(query) {
      const groups = SecurityGroupRepository.list();
      return { success: true, data: groups };
    },
    getById(id) {
      const group = SecurityGroupRepository.getById(id);
      if (!group) {
        return {
          success: false,
          error: "NotFound",
        };
      }
      return { success: true, data: group };
    },
    create(data) {
      const newGroup = SecurityGroupRepository.create(data);
      if (!newGroup) {
        return {
          success: false,
          error: "BadRequest",
        };
      }
      return { success: true, data: newGroup };
    },
    update(id, data) {
      const updatedGroup = SecurityGroupRepository.update(id, data);
      if (!updatedGroup) {
        return {
          success: false,
          error: "NotFound",
        };
      }
      return { success: true, data: updatedGroup };
    },
    delete(id) {
      const deleted = SecurityGroupRepository.deleteById(id);
      if (!deleted) {
        return { success: false, error: "NotFound" };
      }
      return { success: true, data: null };
    },
  };
  return SecurityGroupService;
};

export const getSecurityRuleService = (
  permission: UserPermissions,
  sgId: string
) => {
  const SecurityRuleService: ResourceService<
    SecurityRuleResponse,
    SecurityRuleCreateRequest,
    SecurityRulePatchRequest | SecurityRulePutRequest,
    ServiceError
  > = {
    permission,
    list(query) {
      const rules = SecurityGroupRepository.listRules(sgId);
      if (!rules) {
        return {
          success: false,
          error: "NotFound",
        };
      }
      return { success: true, data: rules };
    },
    getById(id) {
      const rule = SecurityGroupRepository.getRuleById(sgId, id);
      if (!rule) {
        return {
          success: false,
          error: "NotFound",
        };
      }
      return { success: true, data: rule };
    },
    create(data) {
      const newRule = SecurityGroupRepository.createRule(sgId, data);
      if (!newRule) {
        return {
          success: false,
          error: "BadRequest",
        };
      }
      return { success: true, data: newRule };
    },
    update(id, data) {
      const updatedRule = SecurityGroupRepository.updateRule(sgId, id, data);
      if (!updatedRule) {
        return {
          success: false,
          error: "NotFound",
        };
      }
      return { success: true, data: updatedRule };
    },
    delete(id) {
      const deleted = SecurityGroupRepository.deleteRule(sgId, id);
      if (!deleted) {
        return { success: false, error: "NotFound" };
      }
      return { success: true, data: null };
    },
  };
  return SecurityRuleService;
};
