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

// --- ユーザークライアント側更新用スキーマ（設定画面：条件付きPW変更対応） ---
export const UserClientUpdateSchema = z
  .object({
    name: z.string().min(1, "アカウント名は必須です。"),
    email: z.email("有効なメールアドレスを入力してください。"),

    // パスワード変更（変更しないなら全部空でOK）
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
    newPasswordConfirm: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const cp = (data.currentPassword ?? "").trim();
    const np = (data.newPassword ?? "").trim();
    const nc = (data.newPasswordConfirm ?? "").trim();

    // どれか入力されたら「変更する意志あり」
    const anyFilled = cp !== "" || np !== "" || nc !== "";
    if (!anyFilled) return;

    // 変更するなら全部必須
    if (cp === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["currentPassword"],
        message: "現在のパスワードは必須です。",
      });
    }

    if (np === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["newPassword"],
        message: "新しいパスワードは必須です。",
      });
    } else if (np.length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["newPassword"],
        message: "パスワードは8文字以上である必要があります。",
      });
    }

    if (nc === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["newPasswordConfirm"],
        message: "新しいパスワード（確認）は必須です。",
      });
    }

    if (np !== "" && nc !== "" && np !== nc) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["newPasswordConfirm"],
        message: "新しいパスワードが一致しません。",
      });
    }

    // 任意：現在PWと同一はNG（不要ならこのブロック削除OK）
    if (cp !== "" && np !== "" && cp === np) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["newPassword"],
        message: "現在のパスワードと異なる値を指定してください。",
      });
    }
  });

// --- 型エクスポート ---
export type UserCreateInput = z.infer<typeof UserSchema>;
export type UserUpdateInput = z.infer<typeof UserUpdateSchema>;
export type UserClientUpdateInput = z.infer<typeof UserClientUpdateSchema>;
