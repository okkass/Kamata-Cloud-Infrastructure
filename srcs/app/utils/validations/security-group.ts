import * as z from "zod";

const ruleSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "ルール名は必須です。"),
  protocol: z.enum(["tcp", "udp", "icmp", "any"]),
  port: z.preprocess(
    (val) => (val === "" || val === null ? null : Number(val)),
    z
      .number({ message: "数値を入力してください。" })
      .int("整数で入力してください")
      .min(0)
      .max(65535)
      .nullable()
      .optional()
  ),
  targetIp: z.cidrv4("有効なCIDR形式で入力してください。"),
  action: z.enum(["allow", "deny"]),
  ruleType: z.enum(["inbound", "outbound"]),
  createdAt: z.string().optional(),
});

export const securityGroupSchema = z.object({
  name: z.string().min(1, "グループ名は必須です。"),
  description: z.string().optional(),
  inboundRules: z.array(ruleSchema),
  outboundRules: z.array(ruleSchema),
});

export type SecurityGroupFormValues = z.infer<typeof securityGroupSchema>;
export type SecurityRuleFormValues = z.infer<typeof ruleSchema>;
