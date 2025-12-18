/**
 * =================================================================================
 * 利用者追加フォーム Composable (useUserAddForm.ts)
 * =================================================================================
 */
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useResourceCreate } from "~/composables/useResourceCreate";
import { useToast } from "~/composables/useToast";
import { convertUnitToByte } from "~/utils/format";

// ★ 共有型定義をインポート
import type { UserCreateRequest } from "~~/shared/types/dto/user/UserCreateRequest";
import type { UserServerBase } from "~~/shared/types/dto/user/UserServerBase";

// =============================================================================
// Validation Schema (バリデーションスキーマ)
// =============================================================================
const validationSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, "アカウント名は必須です。"),
    email: z
      .string()
      .min(1, "メールアドレスは必須です。")
      .email("有効なメールアドレスを入力してください。"),
    password: z.string().min(8, "パスワードは8文字以上で入力してください。"),

    // クォータ
    maxCpuCores: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z.number().positive("1以上の値を入力してください。").optional()
    ),
    maxMemorySizeInMb: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z.number().positive("1以上の値を入力してください。").optional()
    ),
    maxStorageSizeInGb: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z.number().positive("1以上の値を入力してください。").optional()
    ),

    // 権限
    isAdmin: z.boolean(),
    isImageAdmin: z.boolean(),
    isInstanceTypeAdmin: z.boolean(),
    isNetworkAdmin: z.boolean(),
    isNodeAdmin: z.boolean(),
    isSecurityGroupAdmin: z.boolean(),
    isVirtualMachineAdmin: z.boolean(),
  })
);

/**
 * 利用者追加フォームのロジック
 */
export function useUserAddForm() {
  const { addToast } = useToast();

  // ★ useResourceCreate の型引数を共有型定義に変更
  // Request: UserCreateRequest, Response: UserServerBase
  const { executeCreate, isCreating } = useResourceCreate<
    UserCreateRequest,
    UserServerBase
  >("users");

  // ============================================================================
  // Form Setup (VeeValidate)
  // ============================================================================
  const { errors, defineField, handleSubmit, resetForm } = useForm({
    validationSchema,
    initialValues: {
      name: "",
      email: "",
      password: "",
      maxCpuCores: undefined,
      maxMemorySizeInMb: undefined,
      maxStorageSizeInGb: undefined,
      isAdmin: false,
      isImageAdmin: false,
      isInstanceTypeAdmin: false,
      isNetworkAdmin: false,
      isNodeAdmin: false,
      isSecurityGroupAdmin: false,
      isVirtualMachineAdmin: false,
    },
  });

  // --- フィールド定義 ---
  const [name, nameAttrs] = defineField("name");
  const [email, emailAttrs] = defineField("email");
  const [password, passwordAttrs] = defineField("password");

  const [maxCpuCores, maxCpuCoresAttrs] = defineField("maxCpuCores");
  const [maxMemorySizeInMb, maxMemorySizeInMbAttrs] =
    defineField("maxMemorySizeInMb");
  const [maxStorageSizeInGb, maxStorageSizeInGbAttrs] =
    defineField("maxStorageSizeInGb");

  const [isAdmin, isAdminAttrs] = defineField("isAdmin");
  const [isImageAdmin, isImageAdminAttrs] = defineField("isImageAdmin");
  const [isInstanceTypeAdmin, isInstanceTypeAdminAttrs] = defineField(
    "isInstanceTypeAdmin"
  );
  const [isNetworkAdmin, isNetworkAdminAttrs] = defineField("isNetworkAdmin");
  const [isNodeAdmin, isNodeAdminAttrs] = defineField("isNodeAdmin");
  const [isSecurityGroupAdmin, isSecurityGroupAdminAttrs] = defineField(
    "isSecurityGroupAdmin"
  );
  const [isVirtualMachineAdmin, isVirtualMachineAdminAttrs] = defineField(
    "isVirtualMachineAdmin"
  );

  // ============================================================================
  // Submission Handler (送信処理)
  // ============================================================================
  const onFormSubmit = (emit: (event: "close" | "success") => void) => {
    return handleSubmit(async (values) => {
      // 単位変換
      const maxMemorySizeInBytes = values.maxMemorySizeInMb
        ? convertUnitToByte(values.maxMemorySizeInMb, "MB")
        : null;

      const maxStorageSizeInBytes = values.maxStorageSizeInGb
        ? convertUnitToByte(values.maxStorageSizeInGb, "GB")
        : null;

      // APIリクエストボディ (UserCreateRequest型)
      const payload: UserCreateRequest = {
        name: values.name,
        email: values.email,
        password: values.password,
        maxCpuCore: values.maxCpuCores ?? null,
        maxMemorySize: maxMemorySizeInBytes,
        maxStorageSize: maxStorageSizeInBytes,
        isAdmin: values.isAdmin,
        isImageAdmin: values.isImageAdmin,
        isInstanceTypeAdmin: values.isInstanceTypeAdmin,
        isNetworkAdmin: values.isNetworkAdmin,
        isNodeAdmin: values.isNodeAdmin,
        isSecurityGroupAdmin: values.isSecurityGroupAdmin,
        isVirtualMachineAdmin: values.isVirtualMachineAdmin,
      };

      // APIリクエストを実行
      const result = await executeCreate(payload);

      if (result.success) {
        addToast({
          message: `利用者「${values.name}」を追加しました。`,
          type: "success",
        });
        emit("success");
        emit("close");
      } else {
        addToast({
          message: "ユーザーの作成に失敗しました。",
          type: "error",
          details: result.error?.message,
        });
      }
    });
  };

  return {
    errors,
    name,
    nameAttrs,
    email,
    emailAttrs,
    password,
    passwordAttrs,
    maxCpuCores,
    maxCpuCoresAttrs,
    maxMemorySizeInMb,
    maxMemorySizeInMbAttrs,
    maxStorageSizeInGb,
    maxStorageSizeInGbAttrs,
    isAdmin,
    isAdminAttrs,
    isImageAdmin,
    isImageAdminAttrs,
    isInstanceTypeAdmin,
    isInstanceTypeAdminAttrs,
    isNetworkAdmin,
    isNetworkAdminAttrs,
    isNodeAdmin,
    isNodeAdminAttrs,
    isSecurityGroupAdmin,
    isSecurityGroupAdminAttrs,
    isVirtualMachineAdmin,
    isVirtualMachineAdminAttrs,
    isCreating,
    onFormSubmit,
    resetForm,
  };
}
