import * as z from "zod";

// --- バックアップ作成用スキーマ ---
export const BackupCreateSchema = z.object({
  name: z.string().min(1, "バックアップ名は必須です。"),
  targetVirtualMachineId: z
    .string({ message: "仮想マシンは必須です。" })
    .min(1, "仮想マシンは必須です。"),
  targetStorageId: z
    .string({ message: "ストレージは必須です。" })
    .min(1, "ストレージは必須です。"),
});

export type BackupCreateInput = z.infer<typeof BackupCreateSchema>;
