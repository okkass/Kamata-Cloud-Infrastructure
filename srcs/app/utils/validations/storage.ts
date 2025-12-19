import * as z from "zod";

/**
 * =================================================================================
 * ストレージプール関連のバリデーションスキーマ (storage.ts)
 * =================================================================================
 */

// --- ストレージプール追加フォーム用スキーマ ---
export const StorageAddSchema = z.object({
  name: z.string().min(1, "プール名は必須です。"),
  nodeId: z
    .string({ message: "物理ノードを選択してください。" })
    .min(1, "物理ノードを選択してください。"),
  devicePath: z
    .string({ message: "デバイスパスを選択してください。" })
    .min(1, "デバイスパスを選択してください。"),
  hasNetworkAccess: z.string(),
});

export type StorageAddFormValues = z.infer<typeof StorageAddSchema>;

// --- ストレージプール編集フォーム用スキーマ ---
export const StorageEditSchema = z.object({
  name: z.string().min(1, "プール名は必須です。"),
  hasNetworkAccess: z.string(),
});

export type StorageEditFormValues = z.infer<typeof StorageEditSchema>;
