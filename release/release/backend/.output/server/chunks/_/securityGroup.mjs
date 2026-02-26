import { z } from 'zod';
import { l as looseUuidSchema } from './serviceResultHandler.mjs';

const updateSecurityGroupSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional()
});
const partialUpdateSecurityGroupSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional()
});
z.object({
  securityGroupId: looseUuidSchema
});
const createSecurityGroupRuleSchema = z.object({
  name: z.string(),
  ruleType: z.union([z.literal("inbound"), z.literal("outbound")]),
  port: z.number().nullable(),
  protocol: z.union([
    z.literal("tcp"),
    z.literal("udp"),
    z.literal("icmp"),
    z.literal("any")
  ]),
  targetIp: z.cidrv4(),
  action: z.union([z.literal("allow"), z.literal("deny")])
});
const updateSecurityGroupRuleSchema = z.object({
  name: z.string(),
  ruleType: z.union([z.literal("inbound"), z.literal("outbound")]),
  port: z.number().nullable(),
  protocol: z.union([
    z.literal("tcp"),
    z.literal("udp"),
    z.literal("icmp"),
    z.literal("any")
  ]),
  targetIp: z.cidrv4(),
  action: z.union([z.literal("allow"), z.literal("deny")])
});
const partialUpdateSecurityGroupRuleSchema = z.object({
  name: z.string().optional(),
  ruleType: z.union([z.literal("inbound"), z.literal("outbound")]).optional(),
  port: z.number().optional().nullable(),
  protocol: z.union([
    z.literal("tcp"),
    z.literal("udp"),
    z.literal("icmp"),
    z.literal("any")
  ]).optional(),
  targetIp: z.cidrv4().optional(),
  action: z.union([z.literal("allow"), z.literal("deny")]).optional()
});
z.object({
  securityGroupId: looseUuidSchema,
  ruleId: looseUuidSchema
});
const createSecurityGroupSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  rules: z.array(createSecurityGroupRuleSchema)
});

export { partialUpdateSecurityGroupRuleSchema as a, updateSecurityGroupRuleSchema as b, createSecurityGroupRuleSchema as c, createSecurityGroupSchema as d, partialUpdateSecurityGroupSchema as p, updateSecurityGroupSchema as u };
//# sourceMappingURL=securityGroup.mjs.map
