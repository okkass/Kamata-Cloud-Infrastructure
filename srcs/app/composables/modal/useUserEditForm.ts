/**
 * =================================================================================
 * 利用者編集フォーム Composable (useUserEditForm.ts)
 * =================================================================================
 */
import { watch } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useResourceUpdate } from "~/composables/useResourceEdit";
import { useToast } from "~/composables/useToast";
import { convertUnitToByte, convertByteToUnit } from "~/utils/format";

// --- 型定義 ---
export interface UserDTO {
  id: string;
  name: string;
  email: string;
  maxCpuCore: number | null;
  maxMemorySize: number | null;
  maxStorageSize: number | null;
  isAdmin: boolean;
  isImageAdmin: boolean;
  isInstanceTypeAdmin: boolean;
  isNetworkAdmin: boolean;
  isPhysicalNodeAdmin: boolean;
  isSecurityGroupAdmin: boolean;
  isVirtualMachineAdmin: boolean;
}

// 更新リクエストボディ (パスワード削除)
interface UserUpdateRequest {
  name: string;
  email: string;
  maxCpuCore: number | null;
  maxMemorySize: number | null;
  maxStorageSize: number | null;
  isAdmin: boolean;
  isImageAdmin: boolean;
  isInstanceTypeAdmin: boolean;
  isNetworkAdmin: boolean;
  isPhysicalNodeAdmin: boolean;
  isSecurityGroupAdmin: boolean;
  isVirtualMachineAdmin: boolean;
}

interface UserEditProps {
  show: boolean;
  userData: UserDTO | null;
}

// =============================================================================
// Validation Schema
// =============================================================================
const validationSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, "アカウント名は必須です。"),
    email: z
      .string()
      .min(1, "メールアドレスは必須です。")
      .email("有効なメールアドレスを入力してください。"),

    // ★ パスワード削除

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
    isPhysicalNodeAdmin: z.boolean(),
    isSecurityGroupAdmin: z.boolean(),
    isVirtualMachineAdmin: z.boolean(),
  })
);

export function useUserEditForm(props: UserEditProps) {
  const { addToast } = useToast();

  const { executeUpdate, isUpdating } = useResourceUpdate<
    UserUpdateRequest,
    UserDTO
  >("users");

  // ============================================================================
  // Form Setup
  // ============================================================================
  const { errors, defineField, handleSubmit, resetForm } = useForm({
    validationSchema,
    initialValues: {
      name: "",
      email: "",
      // ★ パスワード削除
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
  // ★ パスワード削除

  const [maxCpuCores, maxCpuCoresAttrs] = defineField("maxCpuCores");
  const [maxMemorySizeInMb, maxMemorySizeInMbAttrs] =
    defineField("maxMemorySizeInMb");
  const [maxStorageSizeInGb, maxStorageSizeInGbAttrs] =
    defineField("maxStorageSizeInGb");

  // 権限 (Attrs は UI で使わないため削除しても良いが、定義は残しておく)
  const [isAdmin] = defineField("isAdmin");
  const [isImageAdmin] = defineField("isImageAdmin");
  const [isInstanceTypeAdmin] = defineField("isInstanceTypeAdmin");
  const [isNetworkAdmin] = defineField("isNetworkAdmin");
  const [isPhysicalNodeAdmin] = defineField("isPhysicalNodeAdmin");
  const [isSecurityGroupAdmin] = defineField("isSecurityGroupAdmin");
  const [isVirtualMachineAdmin] = defineField("isVirtualMachineAdmin");

  // ============================================================================
  // 初期値の反映
  // ============================================================================
  watch(
    () => props.userData,
    (newData) => {
      if (props.show && newData) {
        resetForm({
          values: {
            name: newData.name,
            email: newData.email,
            // ★ パスワード削除

            maxCpuCores: newData.maxCpuCore ?? undefined,
            maxMemorySizeInMb: newData.maxMemorySize
              ? convertByteToUnit(newData.maxMemorySize, "MB")
              : undefined,
            maxStorageSizeInGb: newData.maxStorageSize
              ? convertByteToUnit(newData.maxStorageSize, "GB")
              : undefined,

            isAdmin: newData.isAdmin,
            isImageAdmin: newData.isImageAdmin,
            isInstanceTypeAdmin: newData.isInstanceTypeAdmin,
            isNetworkAdmin: newData.isNetworkAdmin,
            isPhysicalNodeAdmin: newData.isPhysicalNodeAdmin,
            isSecurityGroupAdmin: newData.isSecurityGroupAdmin,
            isVirtualMachineAdmin: newData.isVirtualMachineAdmin,
          },
        });
      }
    },
    { immediate: true, deep: true }
  );

  // ============================================================================
  // 送信処理
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

      // ペイロード作成 (パスワードなし)
      const payload: UserUpdateRequest = {
        name: values.name,
        email: values.email,

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
    // ★ パスワード削除
    maxCpuCores,
    maxCpuCoresAttrs,
    maxMemorySizeInMb,
    maxMemorySizeInMbAttrs,
    maxStorageSizeInGb,
    maxStorageSizeInGbAttrs,

    // 権限 (Attrsは使用しない)
    isAdmin,
    isImageAdmin,
    isInstanceTypeAdmin,
    isNetworkAdmin,
    isPhysicalNodeAdmin,
    isSecurityGroupAdmin,
    isVirtualMachineAdmin,

    isUpdating,
    onFormSubmit,
  };
}
