/**
 * =================================================================================
 * 利用者追加フォーム Composable (useUserAddForm.ts)
 * ---------------------------------------------------------------------------------
 * ★ defineField / 型不一致エラー対応版
 * =================================================================================
 */
import { useForm, defineField } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useResourceCreate } from "~/composables/useResourceCreate";
import { useToast } from "~/composables/useToast";
import type { UserCreateRequest } from "~~/shared/types/dto/user/UserCreateRequest";
interface UserDTO {
  id: string;
  name: string;
}

// =============================================================================
// Validation Schema (バリデーションスキーマ)
// =============================================================================
const validationSchema = toTypedSchema(
  z.object({
    // (NOTE: 'name', 'email', 'isAdmin' は必須の期待値 に従い、Zodで必須とする)
    name: z.string().min(1, "アカウント名は必須です。"),
    email: z
      .string()
      .min(1, "メールアドレスは必須です。")
      .email("有効なメールアドレスを入力してください。"),
    password: z.string().min(8, "パスワードは8文字以上で入力してください。"),

    // ★★★ 修正箇所 (型エラー対応) ★★★
    // .nullable() (nullを許容) から .optional() (undefinedを許容) に変更
    // (FormInput の v-model.number は空欄の時に undefined を返すため)
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

    // 権限フィールド (Zodでは boolean はデフォルト false を持つため、必須の期待値を満たす)
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

  // ★★★ 'defineField' がないエラーが出る場合 ★★★
  // プロジェクトの VeeValidate のバージョンが古いです (v4.8 未満)。
  // ターミナルで `pnpm upgrade vee-validate @vee-validate/zod` を実行してください。

  const { errors, defineField, handleSubmit, resetForm } = useForm({
    validationSchema,
    initialValues: {
      name: "",
      email: "",
      password: "",

      // ★★★ 修正箇所 (型エラー対応) ★★★
      // null -> undefined に変更
      maxCpuCores: undefined,
      maxMemorySizeInMb: undefined,
      maxStorageSizeInGb: undefined,

      // 権限の初期値はすべて false
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
  // クォータ
  const [maxCpuCores, maxCpuCoresAttrs] = defineField("maxCpuCores");
  const [maxMemorySizeInMb, maxMemorySizeInMbAttrs] =
    defineField("maxMemorySizeInMb");
  const [maxStorageSizeInGb, maxStorageSizeInGbAttrs] =
    defineField("maxStorageSizeInGb");
  // 権限
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
      // 単位変換 (values.xxx が undefined の場合、null に変換される)
      const maxMemorySizeInBytes = values.maxMemorySizeInMb
        ? values.maxMemorySizeInMb * 1024 * 1024 // MB to Bytes
        : null; // undefined なら null
      const maxStorageSizeInBytes = values.maxStorageSizeInGb
        ? values.maxStorageSizeInGb * 1024 * 1024 * 1024 // GB to Bytes
        : null; // undefined なら null

      // API (POST) リクエストボディを作成 (UserCreateRequest 形式)
      const payload: UserCreateRequest = {
        name: values.name,
        email: values.email,
        password: values.password,

        // ★ undefined なら null になるように
        maxCpuCore: values.maxCpuCores ?? null,
        maxMemorySize: maxMemorySizeInBytes,
        maxStorageSize: maxStorageSizeInBytes,

        // 権限
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

      // ( ... トースト通知と emit ... )
      if (result.success) {
        addToast({
          message: `利用者「${result.data?.name}」を追加しました。`,
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
    // ( ... 各フィールド ... )
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
    // 状態とアクション
    isCreating,
    onFormSubmit,
    resetForm,
  };
}
