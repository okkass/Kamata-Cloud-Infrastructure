import * as z from "zod";

export const snapshotCreateSchema = z.object({
  name: z.string().min(1, "スナップショット名は必須です。"),
  targetVmId: z.string().min(1, "仮想マシンは必須です。"),
  description: z.string().optional(),
});

export type snapshotCreateFormValues = z.infer<typeof snapshotCreateSchema>;
