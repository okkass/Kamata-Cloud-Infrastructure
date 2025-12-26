import * as z from "zod";

const nameSchema = z.string().min(1, "イメージ名は必須です。");
const descriptionSchema = z.string().optional();

// --- イメージ作成用スキーマ ---
export const ImageCreateSchema = z.object({
  name: nameSchema,
  file: z.instanceof(File, { message: "イメージファイルを選択してください。" }),
  description: descriptionSchema,
  nodeId: z
    .string({ message: "作成先ノードを選択してください。" })
    .min(1, "作成先ノードを選択してください。"),
});

export type ImageCreateInput = z.infer<typeof ImageCreateSchema>;

export const ImageUpdateSchema = z.object({
  name: nameSchema,
  description: descriptionSchema,
});

export type ImageUpdateInput = z.infer<typeof ImageUpdateSchema>;
