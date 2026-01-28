import { getPrismaClient } from "./common";
import { Prisma } from "@@/generated/client";
import type { Result } from "@/common/type";
import type { RepositoryError } from "@/common/errors";
import type { Repository } from "./common";
import { PrismaClientKnownRequestError } from "@@/generated/internal/prismaNamespace";

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
      },
    },
  },
} satisfies Prisma.SecurityGroupFindManyArgs;

export type SecurityRuleRecord = {
  uuid: string;
  name: string;
  ruleType: "inbound" | "outbound";
  port: number | null;
  protocol: "tcp" | "udp" | "icmp" | "any";
  targetIp: string;
  action: "allow" | "deny";
  createdAt: Date;
};

export type SecurityGroupRecord = {
  uuid: string;
  name: string;
  description?: string;
  createdAt: Date;
  owner: {
    uuid: string;
    name: string;
  };
  rules: Array<SecurityRuleRecord>;
};

export type SecurityRuleCreateProps = {
  name: string;
  ruleType: "inbound" | "outbound";
  port: number | null;
  protocol: "tcp" | "udp" | "icmp" | "any";
  targetIp: string;
  action: "allow" | "deny";
};

export type SecurityGroupCreateProps = {
  userId: string;
  name: string;
  description?: string;
  rules: Array<SecurityRuleCreateProps>;
};

export type SecurityGroupUpdateProps = {
  name?: string;
  description?: string;
};

export type SecurityRuleUpdateProps = {
  name?: string;
  ruleType?: "inbound" | "outbound";
  port?: number | null;
  protocol?: "tcp" | "udp" | "icmp" | "any";
  targetIp?: string;
  action?: "allow" | "deny";
};

const toResponseRule = (
  row: Prisma.SecurityRuleGetPayload<typeof securityRuleArgs>,
): SecurityRuleRecord => {
  return {
    uuid: row.uuid,
    name: row.name,
    ruleType: row.roleType,
    port: row.port === PORT_ALL ? null : row.port,
    protocol: row.protocol,
    targetIp: row.targetIp,
    action: row.action,
    createdAt: row.createdAt,
  };
};

const toResponseGroup = (
  row: Prisma.SecurityGroupGetPayload<typeof securityGroupArgs>,
): SecurityGroupRecord => {
  return {
    uuid: row.uuid,
    name: row.name,
    description: row.description ?? undefined,
    createdAt: row.createdAt,
    owner: {
      uuid: row.user.uuid,
      name: row.user.name,
    },
    rules: row.rules.map(toResponseRule),
  };
};

// 一覧を取得　ユーザIDでフィルタリング可能
const list = async (
  userUuid?: string,
): Promise<Result<Array<SecurityGroupRecord>, RepositoryError>> => {
  try {
    const prisma = getPrismaClient();
    const whereClause = userUuid ? { user: { uuid: userUuid } } : {};
    const groups = await prisma.securityGroup.findMany({
      where: whereClause,
      ...securityGroupArgs,
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: groups.map(toResponseGroup) };
  } catch (error) {
    return {
      success: false,
      error: {
        reason: "InternalError",
        message: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
};

const getById = async (
  id: string,
): Promise<Result<SecurityGroupRecord | null, RepositoryError>> => {
  try {
    const prisma = getPrismaClient();
    const group = await prisma.securityGroup.findUnique({
      where: { uuid: id },
      ...securityGroupArgs,
    });
    return {
      success: true,
      data: group ? toResponseGroup(group) : null,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        reason: "InternalError",
        message: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
};

const create = async (
  data: SecurityGroupCreateProps,
): Promise<Result<SecurityGroupRecord, RepositoryError>> => {
  try {
    const prisma = getPrismaClient();
    const newGroup = await prisma.securityGroup.create({
      data: {
        name: data.name,
        description: data.description,
        user: {
          connect: { uuid: data.userId },
        },
        rules: {
          create: data.rules.map((rule) => ({
            name: rule.name,
            roleType: rule.ruleType,
            port: rule.port === null ? PORT_ALL : rule.port,
            protocol: rule.protocol,
            targetIp: rule.targetIp,
            action: rule.action,
          })),
        },
      },
      ...securityGroupArgs,
    });
    return { success: true, data: toResponseGroup(newGroup) };
  } catch (error) {
    return {
      success: false,
      error: {
        reason: "InternalError",
        message: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
};

const update = async (
  id: string,
  updateFields: SecurityGroupUpdateProps,
): Promise<Result<SecurityGroupRecord, RepositoryError>> => {
  try {
    const prisma = getPrismaClient();
    const data = await prisma.securityGroup.update({
      where: { uuid: id },
      data: {
        name: updateFields.name,
        description: updateFields.description,
      },
      ...securityGroupArgs,
    });
    return { success: true, data: toResponseGroup(data) };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      // P2025(レコードが見つからない)エラーを処理
      if (error.code === "P2025") {
        return {
          success: false,
          error: {
            reason: "NotFound",
            message: "The specified security group was not found.",
          },
        };
      }
    }
    return {
      success: false,
      error: {
        reason: "InternalError",
        message: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
};

const deleteById = async (
  id: string,
): Promise<Result<void, RepositoryError>> => {
  try {
    const prisma = getPrismaClient();
    await prisma.securityGroup.delete({ where: { uuid: id } });
    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      // P2025(レコードが見つからない)エラーを処理
      if (error.code === "P2025") {
        return {
          success: false,
          error: {
            reason: "NotFound",
            message: "The specified security group was not found.",
          },
        };
      }
    }
    return {
      success: false,
      error: {
        reason: "InternalError",
        message: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
};

const listRules = async (
  securityGroupId: string,
): Promise<Result<Array<SecurityRuleRecord>, RepositoryError>> => {
  try {
    const prisma = getPrismaClient();
    const data = await prisma.securityRule.findMany({
      where: { securityGroup: { uuid: securityGroupId } },
      ...securityRuleArgs,
    });
    return { success: true, data: data.map(toResponseRule) };
  } catch (error) {
    return {
      success: false,
      error: {
        reason: "InternalError",
        message: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
};

const getRuleById = async (
  sgId: string,
  ruleId: string,
): Promise<Result<SecurityRuleRecord | null, RepositoryError>> => {
  try {
    const prisma = getPrismaClient();

    const data = await prisma.securityRule.findUnique({
      where: {
        uuid: ruleId,
        securityGroup: {
          uuid: sgId,
        },
      },

      ...securityRuleArgs,
    });
    return { success: true, data: data ? toResponseRule(data) : null };
  } catch (error) {
    return {
      success: false,
      error: {
        reason: "InternalError",
        message: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
};

const createRule = async (
  sgId: string,
  ruleData: SecurityRuleCreateProps,
): Promise<Result<SecurityRuleRecord, RepositoryError>> => {
  try {
    const prisma = getPrismaClient();
    const data = await prisma.securityRule.create({
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
    return { success: true, data: toResponseRule(data) };
  } catch (error) {
    return {
      success: false,
      error: {
        reason: "InternalError",
        message: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
};

const updateRule = async (
  sgId: string,
  ruleId: string,
  updateFields: SecurityRuleUpdateProps,
): Promise<Result<SecurityRuleRecord, RepositoryError>> => {
  try {
    const prisma = getPrismaClient();
    const data = await prisma.securityRule.update({
      where: {
        uuid: ruleId,
        securityGroup: {
          uuid: sgId,
        },
      },
      data: {
        name: updateFields.name,
        roleType: updateFields.ruleType,
        port: updateFields.port === null ? PORT_ALL : updateFields.port,
        protocol: updateFields.protocol,
        targetIp: updateFields.targetIp,
        action: updateFields.action,
      },
    });
    return { success: true, data: toResponseRule(data) };
  } catch (error) {
    return {
      success: false,
      error: {
        reason: "InternalError",
        message: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
};

const deleteRule = async (
  sgId: string,
  ruleId: string,
): Promise<Result<void, RepositoryError>> => {
  try {
    const prisma = getPrismaClient();
    await prisma.securityRule.delete({
      where: {
        uuid: ruleId,
        securityGroup: {
          uuid: sgId,
        },
      },
    });
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: {
        reason: "InternalError",
        message: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
};

type SecurityGroupRepositoryType = Repository<
  SecurityGroupCreateProps,
  SecurityGroupUpdateProps,
  SecurityGroupRecord
> & {
  listRules: (
    securityGroupId: string,
  ) => Promise<Result<Array<SecurityRuleRecord>, RepositoryError>>;
  getRuleById: (
    sgId: string,
    ruleId: string,
  ) => Promise<Result<SecurityRuleRecord | null, RepositoryError>>;
  createRule: (
    sgId: string,
    ruleData: SecurityRuleCreateProps,
  ) => Promise<Result<SecurityRuleRecord, RepositoryError>>;
  updateRule: (
    sgId: string,
    ruleId: string,
    updateFields: SecurityRuleUpdateProps,
  ) => Promise<Result<SecurityRuleRecord, RepositoryError>>;
  deleteRule: (
    sgId: string,
    ruleId: string,
  ) => Promise<Result<void, RepositoryError>>;
};

export const SecurityGroupRepository: SecurityGroupRepositoryType = {
  list,
  getById,
  create,
  update,
  deleteById,
  listRules,
  getRuleById,
  createRule,
  updateRule,
  deleteRule,
};

export default SecurityGroupRepository;
