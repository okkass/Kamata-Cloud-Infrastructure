import type {
  SecurityGroupResponse,
  SecurityRuleResponse,
  SecurityGroupCreateRequest,
  SecurityGroupPutRequest,
  SecurityGroupPatchRequest,
  SecurityRuleCreateRequest,
} from "@app/shared/types";
import crypto from "crypto";

let securityGroups: Array<SecurityGroupResponse> = [
  {
    id: "81c210f6-8f8a-4554-9dd4-c58986827357",
    name: "Web-SG",
    description: "Security group for web servers",
    createdAt: new Date().toISOString(),
    rules: [
      {
        id: "52f69034-1b7f-4bfc-a30e-0bd0284f7d0d",
        name: "allow-http",
        ruleType: "inbound",
        port: 80,
        protocol: "tcp",
        targetIp: "0.0.0.0/0",
        action: "allow",
        createdAt: new Date().toISOString(),
      },
      {
        id: "ae5257aa-625b-415d-b042-424fd0403f4a",
        name: "allow-https",
        ruleType: "inbound",
        port: 443,
        protocol: "tcp",
        targetIp: "0.0.0.0/0",
        action: "allow",
        createdAt: new Date().toISOString(),
      },
      {
        id: "aad48b6d-9940-416d-a06d-c470bccd83f5",
        name: "allow-outbound",
        ruleType: "outbound",
        port: null,
        protocol: "any",
        targetIp: "0.0.0.0/0",
        action: "allow",
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: "34f76cdb-3c33-4f7c-a27e-ef548e4f1d8c",
    name: "Wireguard-SG",
    description: "Security group for wireguard servers",
    createdAt: new Date().toISOString(),
    rules: [
      {
        id: "71d1b46e-f673-4b8e-a246-460c175fef70",
        name: "allow-wireguard",
        ruleType: "inbound",
        port: 51820,
        protocol: "udp",
        targetIp: "0.0.0.0/0",
        action: "allow",
        createdAt: new Date().toISOString(),
      },
      {
        id: "bbf19d46-143e-4ebe-bb93-6e805860e40d",
        name: "allow-outbound",
        ruleType: "outbound",
        port: null,
        protocol: "any",
        targetIp: "0.0.0.0/0",
        action: "allow",
        createdAt: new Date().toISOString(),
      },
    ],
  },
];

const list = (): Array<SecurityGroupResponse> => {
  return securityGroups;
};

const getById = (id: string): SecurityGroupResponse | undefined => {
  return securityGroups.find((sg) => sg.id === id);
};

const create = (
  securityGroupData: SecurityGroupCreateRequest
): SecurityGroupResponse => {
  const newSecurityGroup: SecurityGroupResponse = {
    id: crypto.randomUUID(),
    name: securityGroupData.name,
    description: securityGroupData.description,
    createdAt: new Date().toISOString(),
    rules: securityGroupData.rules.map((rule) => ({
      id: crypto.randomUUID(),
      name: rule.name,
      ruleType: rule.ruleType,
      port: rule.port ?? null,
      protocol: rule.protocol,
      targetIp: rule.targetIp,
      action: rule.action ?? "allow",
      createdAt: new Date().toISOString(),
    })),
  };
  securityGroups.push(newSecurityGroup);
  return newSecurityGroup;
};

const update = (
  id: string,
  updateFields: SecurityGroupPutRequest | SecurityGroupPatchRequest
): SecurityGroupResponse | undefined => {
  let target = getById(id);
  if (target === undefined) {
    return undefined;
  }

  target.name = updateFields.name ?? target.name;
  target.description = updateFields.description ?? target.description;

  return target;
};

const deleteById = (id: string): boolean => {
  const initialLength = securityGroups.length;
  securityGroups = securityGroups.filter((sg) => sg.id !== id);
  return securityGroups.length < initialLength;
};

const listRules = (
  securityGroupId: string
): Array<SecurityRuleResponse> | undefined => {
  const securityGroup = getById(securityGroupId);
  return securityGroup?.rules;
};

const getRuleById = (
  sgId: string,
  ruleId: string
): SecurityRuleResponse | undefined => {
  const securityGroup = getById(sgId);
  return securityGroup?.rules.find((rule) => rule.id === ruleId);
};

const createRule = (
  sgId: string,
  ruleData: SecurityRuleCreateRequest
): SecurityRuleResponse | undefined => {
  const securityGroup = getById(sgId);
  if (!securityGroup) {
    return undefined;
  }

  const newRule: SecurityRuleResponse = {
    id: crypto.randomUUID(),
    name: ruleData.name,
    ruleType: ruleData.ruleType,
    port: ruleData.port ?? null,
    protocol: ruleData.protocol,
    targetIp: ruleData.targetIp,
    action: ruleData.action,
    createdAt: new Date().toISOString(),
  };

  securityGroup.rules.push(newRule);
  return newRule;
};

const deleteRule = (sgId: string, ruleId: string): boolean => {
  const securityGroup = getById(sgId);
  if (!securityGroup) {
    return false;
  }

  const initialLength = securityGroup.rules.length;
  securityGroup.rules = securityGroup.rules.filter(
    (rule) => rule.id !== ruleId
  );
  return securityGroup.rules.length < initialLength;
};

export const SecurityGroupRepository = {
  list,
  getById,
  create,
  update,
  deleteById,
  listRules,
  getRuleById,
  createRule,
  deleteRule,
};
