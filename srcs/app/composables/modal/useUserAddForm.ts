/**
 * =================================================================================
 * 利用者追加フォーム Composable (useUserAddForm.ts)
 * ---------------------------------------------------------------------------------
 * ★ トースト通知の修正 (result.data?.name -> values.name)
 * =================================================================================
 */
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useResourceCreate } from "~/composables/useResourceCreate";
import { useToast } from "~/composables/useToast";
import type { UserCreateRequest } from "~~/shared/types/dto/user/UserCreateRequest";
// format.ts から convertUnitToByte をインポート (前回の変更を維持)
import { convertUnitToByte } from "~/utils/format";

interface UserDTO {
  id: string;
  name: string;
}

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

    maxCpuCores: z
      .number()
      .positive("1以上の値を入力してください。")
      .optional(),
    maxMemorySizeInMb: z
      .number()
      .positive("1以上の値を入力してください。")
      .optional(),
    maxStorageSizeInGb: z
      .number()
      .positive("1以上の値を入力してください。")
      .optional(),

    isAdmin: z.boolean(),
    isImageAdmin: z.boolean(),
    isInstanceTypeAdmin: z.boolean(),
    isNetworkAdmin: z.boolean(),
    isPhysicalNodeAdmin: z.boolean(),
    isSecurityGroupAdmin: z.boolean(),
    isVirtualMachineAdmin: z.boolean(),
  })
);

/**
 * 利用者追加フォームのロジック
 */
export function useUserAddForm() {
  const { addToast } = useToast();
  const { executeCreate, isCreating } = useResourceCreate<
    UserCreateRequest,
    UserDTO
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
      isPhysicalNodeAdmin: false,
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
  const [isPhysicalNodeAdmin, isPhysicalNodeAdminAttrs] = defineField(
    "isPhysicalNodeAdmin"
  );
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

      // APIリクエストボディ
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
        isPhysicalNodeAdmin: values.isPhysicalNodeAdmin,
        isSecurityGroupAdmin: values.isSecurityGroupAdmin,
        isVirtualMachineAdmin: values.isVirtualMachineAdmin,
      };

      // APIリクエストを実行
      const result = await executeCreate(payload);

      if (result.success) {
        addToast({
          // ★★★ 修正箇所 ★★★
          // APIのレスポンス (result.data.name) ではなく、
          // 送信に成功したフォームの入力値 (values.name) を使用します。
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

  // ============================================================================
  // Expose (外部への公開)
  // ============================================================================
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
    isPhysicalNodeAdmin,
    isPhysicalNodeAdminAttrs,
    isSecurityGroupAdmin,
    isSecurityGroupAdminAttrs,
    isVirtualMachineAdmin,
    isVirtualMachineAdminAttrs,
    isCreating,
    onFormSubmit,
    resetForm,
  };
}
