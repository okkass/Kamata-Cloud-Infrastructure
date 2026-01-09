/**
 * =================================================================================
 * 仮想マシン関連のバリデーションスキーマ
 * ---------------------------------------------------------------------------------
 * 仮想マシンの作成・編集で共有するZodスキーマを定義しています。
 * Create と Edit の両コンポーネントでこれらのスキーマを利用してバリデーションを統一します。
 * =================================================================================
 */

import * as z from "zod";

/**
 * 一般情報タブのスキーマ（Create 用）
 */
export const vmGeneralCreateSchema = z.object({
  name: z.string().min(1, "仮想マシン名は必須です。"),
  nodeId: z.string("ノードは必須です。").min(1, "ノードを選択してください"),
});

export type VmGeneralCreateInput = z.infer<typeof vmGeneralCreateSchema>;

/**
 * 一般情報タブのスキーマ（Edit 用）
 */
export const vmGeneralEditSchema = z.object({
  name: z.string().min(1, "仮想マシン名は必須です。"),
  description: z.string().optional(),
});

export type VmGeneralEditInput = z.infer<typeof vmGeneralEditSchema>;

/**
 * コンピュート・ストレージタブのスキーマ
 */
export const vmConfigSchema = z.object({
  templateId: z.string().optional(),
  cpuCore: z.preprocess(
    (val) => (val === "" || val === null ? undefined : Number(val)),
    z.number().min(1, "1コア以上を指定してください。").optional()
  ),
  memorySize: z.preprocess(
    (val) => (val === "" || val === null ? undefined : Number(val)),
    z.number().min(512, "512MB以上を指定してください。").optional()
  ),
  backupId: z.string().optional().nullable(),
  storages: z.array(
    z.object({
      id: z.any().optional(),
      name: z.string().min(1, "名前は必須です。"),
      size: z.number().min(1, "1GB以上の正の数値を指定してください。"),
      poolId: z.string("プールを選択してください。").min(1, "プールを選択してください。"),
      type: z.string().optional(),
    })
  ),
});

export type VmConfigInput = z.infer<typeof vmConfigSchema>;

/**
 * OS/ミドルウェアタブのスキーマ（Create 用）
 */
export const vmOsMiddlewareCreateSchema = z.object({
  osImageId: z
    .string("OSイメージを選択してください。")
    .min(1, "OSイメージを選択してください。"),
  middlewareId: z.string().optional().nullable(),
});

export type VmOsMiddlewareCreateInput = z.infer<
  typeof vmOsMiddlewareCreateSchema
>;

/**
 * ネットワーク/セキュリティタブのスキーマ（Create 用）
 */
export const vmNetworkCreateSchema = z.object({
  networkInterfaces: z
    .array(
      z.object({
        vpcId: z.string().min(1, "VPCを選択してください。"),
        subnetIds: z
          .array(z.string())
          .min(1, "少なくとも1つのサブネットを選択してください。"),
      })
    )
    .min(1, "少なくとも1つのネットワークインターフェースを追加してください。"),
  securityGroupIds: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    })
  ),
  keyPairFile: z.any().optional().nullable(),
});

export type VmNetworkCreateInput = z.infer<typeof vmNetworkCreateSchema>;

/**
 * ネットワーク/セキュリティタブのスキーマ（Edit 用）
 */
export const vmNetworkEditSchema = z.object({
  networkInterfaces: z
    .array(
      z.object({
        id: z.string().optional(),
        networkId: z.string().min(1, "ネットワークを選択してください。"),
        subnetId: z.string().min(1, "サブネットを選択してください。"),
      })
    )
    .optional(),
  securityGroups: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
      })
    )
    .min(1, "セキュリティグループは1つ以上必須です。"),
});

export type VmNetworkEditInput = z.infer<typeof vmNetworkEditSchema>;
