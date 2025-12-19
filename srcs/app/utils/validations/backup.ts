import * as z from "zod";

// --- バックアップ作成用スキーマ ---
export const BackupCreateSchema = z.object({
  name: z.string().min(1, "バックアップ名は必須です。"),
  targetVirtualMachineId: z
    .string({ message: "対象の仮想マシンを選択してください。" })
    .min(1, "対象の仮想マシンを選択してください。"),
  targetStorageId: z
    .string({ message: "対象のストレージを選択してください。" })
    .min(1, "対象のストレージを選択してください。"),
});

export type BackupCreateInput = z.infer<typeof BackupCreateSchema>;
