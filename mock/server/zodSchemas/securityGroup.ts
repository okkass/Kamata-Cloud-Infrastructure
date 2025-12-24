import { z } from "zod";
import { looseUuidSchema } from "./common";

export const updateSecurityGroupSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
});

export const partialUpdateSecurityGroupSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
});

export const deleteSecurityGroupSchema = z.object({
  securityGroupId: looseUuidSchema,
});

export const createSecurityGroupRuleSchema = z.object({
  name: z.string(),
  ruleType: z.union([z.literal("inbound"), z.literal("outbound")]),
  port: z.number().nullable(),
  protocol: z.union([
    z.literal("tcp"),
    z.literal("udp"),
    z.literal("icmp"),
    z.literal("any"),
  ]),
  targetIp: z.ipv4(),
  action: z.union([z.literal("allow"), z.literal("deny")]),
});

export const updateSecurityGroupRuleSchema = z.object({
  name: z.string(),
  ruleType: z.union([z.literal("inbound"), z.literal("outbound")]),
  port: z.number().nullable(),
  protocol: z.union([
    z.literal("tcp"),
    z.literal("udp"),
    z.literal("icmp"),
    z.literal("any"),
  ]),
  targetIp: z.ipv4(),
  action: z.union([z.literal("allow"), z.literal("deny")]),
});

export const partialUpdateSecurityGroupRuleSchema = z.object({
  name: z.string().optional(),
  ruleType: z.union([z.literal("inbound"), z.literal("outbound")]).optional(),
  port: z.number().optional(),
  protocol: z
    .union([
      z.literal("tcp"),
      z.literal("udp"),
      z.literal("icmp"),
      z.literal("any"),
    ])
    .optional(),
  targetIp: z.ipv4().optional(),
  action: z.union([z.literal("allow"), z.literal("deny")]).optional(),
});

export const deleteSecurityGroupRuleSchema = z.object({
  securityGroupId: looseUuidSchema,
  ruleId: looseUuidSchema,
});

export const createSecurityGroupSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  rules: z.array(createSecurityGroupRuleSchema),
});
