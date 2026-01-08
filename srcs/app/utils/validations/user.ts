import * as z from "zod";

// --- 再利用可能なパーツ ---
const quotaSchema = z.preprocess(
  (val) => (val === "" ? undefined : val),
  z
    .number()
    .int("1以上の整数を入力してください。")
    .min(1, "1以上の値を入力してください。")
    .optional()
);

const passwordSchema = z
  .string()
  .min(8, "パスワードは8文字以上である必要があります。");

// --- ユーザーベーススキーマ ---
export const UserBaseSchema = z.object({
  name: z.string().min(1, "アカウント名は必須です。"),
  email: z.email("有効なメールアドレスを入力してください。"),

  // クォータ
  maxCpuCore: quotaSchema,
  maxMemorySize: quotaSchema,
  maxStorageSize: quotaSchema,

  // 権限
  isAdmin: z.boolean(),
  isImageAdmin: z.boolean(),
  isInstanceTypeAdmin: z.boolean(),
  isNetworkAdmin: z.boolean(),
  isNodeAdmin: z.boolean(),
  isSecurityGroupAdmin: z.boolean(),
  isVirtualMachineAdmin: z.boolean(),
});

// --- ユーザー作成用スキーマ ---
export const UserSchema = UserBaseSchema.extend({
  password: passwordSchema,
});

// --- ユーザー更新用スキーマ ---
export const UserUpdateSchema = UserBaseSchema;

// --- ユーザークライアント側更新用スキーマ ---
export const UserClientUpdateSchema = z.object({
  name: z.string().min(1, "アカウント名は必須です。"),
  email: z.email("有効なメールアドレスを入力してください。"),
  password: passwordSchema.optional(),
});

// --- 型エクスポート ---

export type UserCreateInput = z.infer<typeof UserSchema>;
export type UserUpdateInput = z.infer<typeof UserUpdateSchema>;
export type UserClientUpdateInput = z.infer<typeof UserClientUpdateSchema>;
