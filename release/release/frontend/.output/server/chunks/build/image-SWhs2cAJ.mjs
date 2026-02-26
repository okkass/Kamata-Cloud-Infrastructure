import * as z from 'zod';

const nameSchema = z.string().min(1, "イメージ名は必須です。");
const descriptionSchema = z.string().optional();
const ImageCreateSchema = z.object({
  name: nameSchema,
  file: z.instanceof(File, { message: "イメージファイルを選択してください。" }),
  description: descriptionSchema,
  storagePoolId: z.string({ message: "作成先ストレージプールを選択してください。" }).min(1, "作成先ストレージプールを選択してください。")
});
const ImageUpdateSchema = z.object({
  name: nameSchema,
  description: descriptionSchema
});

export { ImageCreateSchema as I, ImageUpdateSchema as a };
//# sourceMappingURL=image-SWhs2cAJ.mjs.map
