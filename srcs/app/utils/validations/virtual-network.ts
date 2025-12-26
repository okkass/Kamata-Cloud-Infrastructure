import * as z from "zod";
import { isValidNetworkAddress } from "~/utils/cidr";

/**
 * =================================================================================
 * 仮想ネットワーク関連のバリデーションスキーマ (virtual-network.ts)
 * =================================================================================
 */

// --- サブネット用スキーマ ---
const SubnetSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "サブネット名は必須です。"),
  cidr: z
    .cidrv4("有効なCIDR形式である必要があります。")
    .refine((cidr) => isValidNetworkAddress(cidr), {
      message:
        "ネットワークアドレスが無効です。ホスト部は0である必要があります。",
    }),
});

const VirtualNetworkBaseSchema = z.object({
  name: z.string().min(1, "ネットワーク名は必須です。"),
  cidr: z
    .cidrv4("有効なCIDR形式である必要があります。")
    .refine((cidr) => isValidNetworkAddress(cidr), {
      message:
        "ネットワークアドレスが無効です。ホスト部は0である必要があります。",
    }),
});

export type SubnetFormValues = z.infer<typeof SubnetSchema>;

// --- 仮想ネットワーク作成フォーム用スキーマ ---
export const VirtualNetworkCreateSchema = VirtualNetworkBaseSchema;

export type VirtualNetworkCreateFormValues = z.infer<
  typeof VirtualNetworkCreateSchema
>;

export const VirtualNetworkCreateFullSchema = VirtualNetworkCreateSchema.extend(
  {
    initialSubnets: z.array(SubnetSchema),
  }
);

export type VirtualNetworkCreateFullFormValues = z.infer<
  typeof VirtualNetworkCreateFullSchema
>;

// --- 仮想ネットワーク編集フォーム用スキーマ ---
export const VirtualNetworkEditSchema = VirtualNetworkBaseSchema.extend({
  subnets: z.array(SubnetSchema),
});

export type VirtualNetworkEditFormValues = z.infer<
  typeof VirtualNetworkEditSchema
>;
