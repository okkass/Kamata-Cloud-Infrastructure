import * as z from 'zod';

const quotaSchema = z.preprocess(
  (val) => val === "" ? void 0 : val,
  z.number().int("1以上の整数を入力してください。").min(1, "1以上の値を入力してください。").optional()
);
const passwordSchema = z.string().min(8, "パスワードは8文字以上である必要があります。");
const UserBaseSchema = z.object({
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
  isVirtualMachineAdmin: z.boolean()
});
const UserSchema = UserBaseSchema.extend({
  password: passwordSchema
});
const UserUpdateSchema = UserBaseSchema;
const UserClientUpdateSchema = z.object({
  name: z.string().min(1, "アカウント名は必須です。"),
  email: z.email("有効なメールアドレスを入力してください。"),
  // パスワード変更（変更しないなら全部空でOK）
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  newPasswordConfirm: z.string().optional()
}).superRefine((data, ctx) => {
  const cp = (data.currentPassword ?? "").trim();
  const np = (data.newPassword ?? "").trim();
  const nc = (data.newPasswordConfirm ?? "").trim();
  const anyFilled = cp !== "" || np !== "" || nc !== "";
  if (!anyFilled) return;
  if (cp === "") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["currentPassword"],
      message: "現在のパスワードは必須です。"
    });
  }
  if (np === "") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["newPassword"],
      message: "新しいパスワードは必須です。"
    });
  } else {
    const passwordValidation = passwordSchema.safeParse(np);
    if (!passwordValidation.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["newPassword"],
        message: passwordValidation.error.issues[0]?.message || "パスワードが無効です。"
      });
    }
  }
  if (nc === "") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["newPasswordConfirm"],
      message: "新しいパスワード（確認）は必須です。"
    });
  }
  if (np !== "" && nc !== "" && np !== nc) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["newPasswordConfirm"],
      message: "新しいパスワードが一致しません。"
    });
  }
  if (cp !== "" && np !== "" && cp === np) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["newPassword"],
      message: "現在のパスワードと異なる値を指定してください。"
    });
  }
});

export { UserClientUpdateSchema as U, UserSchema as a, UserUpdateSchema as b };
//# sourceMappingURL=user-BB0TVvYL.mjs.map
