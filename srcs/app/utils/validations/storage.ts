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
    .string({ message: "物理ノードは必須です。" })
    .min(1, "物理ノードは必須です。"),
  devicePath: z
    .string({ message: "デバイスパスは必須です。" })
    .min(1, "デバイスパスは必須です。"),
  hasNetworkAccess: z.string(),
});

export type StorageAddFormValues = z.infer<typeof StorageAddSchema>;

// --- ストレージプール編集フォーム用スキーマ ---
export const StorageEditSchema = z.object({
  name: z.string().min(1, "プール名は必須です。"),
  hasNetworkAccess: z.string(),
});

export type StorageEditFormValues = z.infer<typeof StorageEditSchema>;
