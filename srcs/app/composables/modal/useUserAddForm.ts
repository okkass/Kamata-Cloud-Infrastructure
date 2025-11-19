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
import type { UserCreateRequest } from "~~/shared/types/dto/user/UserCreateRequest";
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

    // ★★★ 修正箇所 ★★★
    // z.preprocess を使用して、入力が空文字 "" の場合、null に変換してから検証します。
    // これにより、フォームを空にすると null 扱いに

    maxCpuCores: z.preprocess(
      (val) => (val === "" ? null : val),
      z.number().positive("1以上の値を入力してください。").optional()
    ),

    maxMemorySizeInMb: z.preprocess(
      (val) => (val === "" ? null : val),
      z.number().positive("1以上の値を入力してください。").optional()
    ),

    maxStorageSizeInGb: z.preprocess(
      (val) => (val === "" ? null : val),
      z.number().positive("1以上の値を入力してください。").optional()
    ),

    // (権限フィールド)
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
      // 初期値は undefined
      maxCpuCores: undefined,
      maxMemorySizeInMb: undefined,
      maxStorageSizeInGb: undefined,
      // 権限初期値
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

        // values.maxCpuCores は undefined なので、?? null により null が入る
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
  // Expose
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
