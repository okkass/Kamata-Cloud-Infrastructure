/**
 * =================================================================================
 * 利用者編集フォーム Composable (useUserEditForm.ts)
 * ---------------------------------------------------------------------------------
 * ★ 型定義ファイルを指定のものに変更
 * =================================================================================
 */
import { watch } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useResourceUpdate } from "~/composables/useResourceEdit";
import { useToast } from "~/composables/useToast";
import { convertUnitToByte, convertByteToUnit } from "~/utils/format";

// ★ 指定された型定義をインポート
import type { UserResponse } from "~~/shared/types";
import type { UserPutRequest } from "~~/shared/types";

// Props の型定義
interface UserEditProps {
  show: boolean;
  userData: UserResponse | null; // ★ UserDTO -> UserServerBase に変更
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
 * 利用者編集フォームのロジック
 */
export function useUserEditForm(props: UserEditProps) {
  const { addToast } = useToast();

  // ★ 更新用 Composable の型引数を変更
  const { executeUpdate, isUpdating } = useResourceUpdate<
    UserPutRequest, // リクエスト型
    UserResponse // レスポンス型
  >("users");

  // ============================================================================
  // Form Setup (VeeValidate)
  // ============================================================================
  const { errors, defineField, handleSubmit, resetForm } = useForm({
    validationSchema,
    initialValues: {
      name: "",
      email: "",
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

  const [maxCpuCores, maxCpuCoresAttrs] = defineField("maxCpuCores");
  const [maxMemorySizeInMb, maxMemorySizeInMbAttrs] =
    defineField("maxMemorySizeInMb");
  const [maxStorageSizeInGb, maxStorageSizeInGbAttrs] =
    defineField("maxStorageSizeInGb");

  // 権限
  const [isAdmin] = defineField("isAdmin");
  const [isImageAdmin] = defineField("isImageAdmin");
  const [isInstanceTypeAdmin] = defineField("isInstanceTypeAdmin");
  const [isNetworkAdmin] = defineField("isNetworkAdmin");
  const [isNodeAdmin] = defineField("isNodeAdmin");
  const [isSecurityGroupAdmin] = defineField("isSecurityGroupAdmin");
  const [isVirtualMachineAdmin] = defineField("isVirtualMachineAdmin");

  // ============================================================================
  // 初期値の反映 (Watch)
  // ============================================================================
  watch(
    () => props.userData,
    (newData) => {
      if (props.show && newData) {
        resetForm({
          values: {
            name: newData.name,
            email: newData.email,

            // クォータ: UserServerBase のプロパティを使用
            maxCpuCores: newData.maxCpuCore ?? undefined,
            maxMemorySizeInMb: newData.maxMemorySize
              ? convertByteToUnit(newData.maxMemorySize, "MB")
              : undefined,
            maxStorageSizeInGb: newData.maxStorageSize
              ? convertByteToUnit(newData.maxStorageSize, "GB")
              : undefined,

            // 権限
            isAdmin: newData.isAdmin,
            isImageAdmin: newData.isImageAdmin,
            isInstanceTypeAdmin: newData.isInstanceTypeAdmin,
            isNetworkAdmin: newData.isNetworkAdmin,
            isNodeAdmin: newData.isNodeAdmin,
            isSecurityGroupAdmin: newData.isSecurityGroupAdmin,
            isVirtualMachineAdmin: newData.isVirtualMachineAdmin,
          },
        });
      }
    },
    { immediate: true, deep: true }
  );

  // ============================================================================
  // Submission Handler (送信処理)
  // ============================================================================
  const onFormSubmit = (emit: (event: "close" | "success") => void) => {
    return handleSubmit(async (values) => {
      if (!props.userData?.id) return;

      const maxMemorySizeInBytes = values.maxMemorySizeInMb
        ? convertUnitToByte(values.maxMemorySizeInMb, "MB")
        : null;

      const maxStorageSizeInBytes = values.maxStorageSizeInGb
        ? convertUnitToByte(values.maxStorageSizeInGb, "GB")
        : null;

      // ペイロード作成: UserPutRequest 型に準拠
      const payload: UserPutRequest = {
        name: values.name,
        email: values.email,

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

      // APIリクエスト (PUT)
      const { success, error } = await executeUpdate(
        props.userData.id,
        payload
      );

      if (success) {
        addToast({
          message: `利用者「${values.name}」を更新しました。`,
          type: "success",
        });
        emit("success");
        emit("close");
      } else {
        addToast({
          message: "ユーザーの更新に失敗しました。",
          type: "error",
          details: error?.message,
        });
      }
    });
  };

  return {
    errors,
    // フィールド
    name,
    nameAttrs,
    email,
    emailAttrs,
    maxCpuCores,
    maxCpuCoresAttrs,
    maxMemorySizeInMb,
    maxMemorySizeInMbAttrs,
    maxStorageSizeInGb,
    maxStorageSizeInGbAttrs,
    isAdmin,
    isImageAdmin,
    isInstanceTypeAdmin,
    isNetworkAdmin,
    isNodeAdmin,
    isSecurityGroupAdmin,
    isVirtualMachineAdmin,

    isUpdating,
    onFormSubmit,
  };
}
