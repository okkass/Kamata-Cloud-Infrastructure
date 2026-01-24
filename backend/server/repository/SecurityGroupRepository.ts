import { getPrismaClient } from "./common";
import { Prisma } from "@@/generated/client";

// 設計思想としては例外はRepository層でキャッチせずにService層に投げる。
// Service層で必要に応じて例外処理を行う。

// DB上での全ポート(=APIで言うnull)を表す定数
const PORT_ALL = 65536;

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
  name: string;
  ruleType: "inbound" | "outbound";
  port: number | null;
  protocol: "tcp" | "udp" | "icmp" | "any";
  targetIp: string;
  action: "allow" | "deny";
};

export type SecurityGroupCreateInput = {
  userId: string;
  name: string;
  description?: string;
  rules: Array<SecurityRuleCreateInput>;
};

export type SecurityGroupUpdateInput = {
  name?: string;
  description?: string;
};

export type SecurityRuleUpdateInput = {
  name?: string;
  ruleType?: "inbound" | "outbound";
  port?: number | null;
  protocol?: "tcp" | "udp" | "icmp" | "any";
  targetIp?: string;
  action?: "allow" | "deny";
};

// 一覧を取得　ユーザIDでフィルタリング可能
const list = async (userUuid?: string): Promise<Array<SecurityGroupRecord>> => {
  const prisma = getPrismaClient();

  let userId = undefined;

  if (userUuid) {
    const user = await prisma.user.findUnique({
      where: { uuid: userUuid },
      select: { id: true },
    });
    if (user) {
      userId = user.id;
    } else {
      return [];
    }
  }

  return await prisma.securityGroup.findMany({
    where: userId ? { userId: userId } : {},
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
  data: SecurityGroupCreateInput,
): Promise<SecurityGroupRecord> => {
  const prisma = getPrismaClient();
  return await prisma.securityGroup.create({
    data: {
      name: data.name,
      description: data.description,
      user: {
        connect: { uuid: data.userId },
      },
      rules: {
        create: data.rules.map((rule) => {
          return {
            name: rule.name,
            roleType: rule.ruleType,
            port: rule.port === null ? PORT_ALL : rule.port,
            protocol: rule.protocol,
            targetIp: rule.targetIp,
            action: rule.action,
          };
        }),
      },
    },
    ...securityGroupArgs,
  });
};

const update = async (
  id: string,
  updateFields: SecurityGroupUpdateInput,
): Promise<SecurityGroupRecord> => {
  const prisma = getPrismaClient();
  return prisma.securityGroup.update({
    where: { uuid: id },
    data: {
      name: updateFields.name,
      description: updateFields.description,
    },
    ...securityGroupArgs,
  });
};

const deleteById = async (id: string): Promise<void> => {
  const prisma = getPrismaClient();
  await prisma.securityGroup.delete({ where: { uuid: id } });
};

const listRules = async (
  securityGroupId: string,
): Promise<Array<SecurityRuleRecord>> => {
  const prisma = getPrismaClient();
  return await prisma.securityRule.findMany({
    where: { securityGroup: { uuid: securityGroupId } },
    ...securityRuleArgs,
  });
};

const getRuleById = async (
  ruleId: string,
): Promise<SecurityRuleRecord | null> => {
  const prisma = getPrismaClient();
  return await prisma.securityRule.findUnique({
    where: { uuid: ruleId },
    ...securityRuleArgs,
  });
};

const createRule = async (
  sgId: string,
  ruleData: SecurityRuleCreateInput,
): Promise<SecurityRuleRecord> => {
  const prisma = getPrismaClient();
  return await prisma.securityRule.create({
    data: {
      name: ruleData.name,
      roleType: ruleData.ruleType,
      port: ruleData.port === null ? PORT_ALL : ruleData.port,
      protocol: ruleData.protocol,
      targetIp: ruleData.targetIp,
      action: ruleData.action,
      securityGroup: {
        connect: { uuid: sgId },
      },
    },
    ...securityRuleArgs,
  });
};

const updateRule = async (
  ruleId: string,
  updateFields: SecurityRuleUpdateInput,
): Promise<SecurityRuleRecord> => {
  const prisma = getPrismaClient();
  return prisma.securityRule.update({
    where: { uuid: ruleId },
    data: {
      name: updateFields.name,
      roleType: updateFields.ruleType,
      port:
        updateFields.port === undefined
          ? undefined
          : updateFields.port === null
            ? PORT_ALL
            : updateFields.port,
      protocol: updateFields.protocol,
      targetIp: updateFields.targetIp,
      action: updateFields.action,
    },
    ...securityRuleArgs,
  });
};

const deleteRule = async (ruleId: string): Promise<void> => {
  const prisma = getPrismaClient();
  await prisma.securityRule.delete({ where: { uuid: ruleId } });
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
