import { getPrismaClient } from "./common";
import { Prisma } from "@@/generated/client";

const securityRuleArgs = {
  select: {
    uuid: true,
    name: true,
    roleType: true,
    port: true,
    protocol: true,
    targetIp: true,
    action: true,
    createdAt: true,
  },
} satisfies Prisma.SecurityRuleFindManyArgs;

const securityGroupArgs = {
  select: {
    uuid: true,
    name: true,
    description: true,
    createdAt: true,
    rules: securityRuleArgs,
    user: {
      select: {
        uuid: true,
        name: true,
        email: true,
      },
    },
  },
} satisfies Prisma.SecurityGroupFindManyArgs;

export type SecurityGroupRecord = Prisma.SecurityGroupGetPayload<
  typeof securityGroupArgs
>;
export type SecurityRuleRecord = Prisma.SecurityRuleGetPayload<
  typeof securityRuleArgs
>;

export type SecurityRuleCreateInput = {
  userId: string;
  securityGroupId: string;
  name: string;
  ruleType: "inbound" | "outbound";
  port: number | null;
  protocol: "tcp" | "udp" | "icmp" | "all";
  targetIp: string;
  action: "allow" | "deny";
};

export type SecurityGroupCreateInput = {
  userId: string;
  name: string;
  description?: string;
  rules: Array<SecurityRuleCreateInput>;
};
const list = async (): Promise<Array<SecurityGroupRecord>> => {
  const prisma = getPrismaClient();

  return await prisma.securityGroup.findMany({
    ...securityGroupArgs,
  });
};

const getById = async (id: string): Promise<SecurityGroupRecord | null> => {
  const prisma = getPrismaClient();

  return await prisma.securityGroup.findUnique({
    where: { uuid: id },
    ...securityGroupArgs,
  });
};

const create = async (
  securityGroupData: SecurityGroupCreateRequest,
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
  updateFields: SecurityGroupPutRequest | SecurityGroupPatchRequest,
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
  securityGroupId: string,
): Array<SecurityRuleResponse> | undefined => {
  const securityGroup = getById(securityGroupId);
  return securityGroup?.rules;
};

const getRuleById = (
  sgId: string,
  ruleId: string,
): SecurityRuleResponse | undefined => {
  const securityGroup = getById(sgId);
  return securityGroup?.rules.find((rule) => rule.id === ruleId);
};

const createRule = (
  sgId: string,
  ruleData: SecurityRuleCreateRequest,
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

const updateRule = (
  sgId: string,
  ruleId: string,
  updateFields: SecurityRulePutRequest | SecurityRulePatchRequest,
): SecurityRuleResponse | undefined => {
  const rule = getRuleById(sgId, ruleId);
  if (!rule) {
    return undefined;
  }

  rule.name = updateFields.name ?? rule.name;
  rule.ruleType = updateFields.ruleType ?? rule.ruleType;
  rule.port = updateFields.port ?? rule.port;
  rule.protocol = updateFields.protocol ?? rule.protocol;
  rule.targetIp = updateFields.targetIp ?? rule.targetIp;
  rule.action = updateFields.action ?? rule.action;

  return rule;
};
const deleteRule = (sgId: string, ruleId: string): boolean => {
  const securityGroup = getById(sgId);
  if (!securityGroup) {
    return false;
  }

  const initialLength = securityGroup.rules.length;
  securityGroup.rules = securityGroup.rules.filter(
    (rule) => rule.id !== ruleId,
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
  updateRule,
};

export default SecurityGroupRepository;
