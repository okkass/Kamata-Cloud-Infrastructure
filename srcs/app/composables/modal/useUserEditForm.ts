/**
 * =================================================================================
 * 利用者編集フォーム Composable (useUserEditForm.ts)
 * ---------------------------------------------------------------------------------
 * ★ 型定義ファイルを指定のものに変更
 * =================================================================================
 */
import { watch } from "vue";
import { useForm } from "vee-validate";
import { UserUpdateSchema } from "~/utils/validations/user";
import { toTypedSchema } from "@vee-validate/zod";
import { useResourceUpdate } from "~/composables/useResourceEdit";
import { useToast } from "~/composables/useToast";
import { convertUnitToByte, convertByteToUnit } from "~/utils/format";
import { useFormAction } from "~/composables/modal/useModalAction";

// ★ 指定された型定義をインポート
import type { UserResponse } from "~~/shared/types";
import type { UserPutRequest } from "~~/shared/types";

type UserEditProps = ModalFormProps<UserResponse>;
/**
 * 利用者編集フォームのロジック
 */
export function useUserEditForm(props: UserEditProps) {
  const { handleFormSubmit, makeHandleClose: createHandleClose } =
    useFormAction();

  // ★ 更新用 Composable の型引数を変更
  const { executeUpdate, isUpdating } = useResourceUpdate<
    UserPutRequest, // リクエスト型
    UserResponse // レスポンス型
  >(USER.name);

  // ============================================================================
  // Form Setup (VeeValidate)
  // ============================================================================
  const { errors, defineField, handleSubmit, resetForm, meta } =
    useForm<UserPutRequest>({
      validationSchema: toTypedSchema(UserUpdateSchema),
      initialValues: {
        name: "",
        email: "",
        maxCpuCore: undefined,
        maxMemorySize: undefined,
        maxStorageSize: undefined,
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

  const [maxCpuCore, maxCpuCoreAttrs] = defineField("maxCpuCore");
  const [maxMemorySize, maxMemorySizeAttrs] = defineField("maxMemorySize");
  const [maxStorageSize, maxStorageSizeAttrs] = defineField("maxStorageSize");
  // 権限
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

  const permissions = {
    isAdmin: { label: "全体管理者", value: isAdmin, attrs: isAdminAttrs },
    isImageAdmin: {
      label: "イメージ管理",
      value: isImageAdmin,
      attrs: isImageAdminAttrs,
    },
    isInstanceTypeAdmin: {
      label: "インスタンスタイプ管理",
      value: isInstanceTypeAdmin,
      attrs: isInstanceTypeAdminAttrs,
    },
    isNetworkAdmin: {
      label: "ネットワーク管理",
      value: isNetworkAdmin,
      attrs: isNetworkAdminAttrs,
    },
    isNodeAdmin: {
      label: "ノード管理",
      value: isNodeAdmin,
      attrs: isNodeAdminAttrs,
    },
    isSecurityGroupAdmin: {
      label: "セキュリティグループ管理",
      value: isSecurityGroupAdmin,
      attrs: isSecurityGroupAdminAttrs,
    },
    isVirtualMachineAdmin: {
      label: "仮想マシン管理",
      value: isVirtualMachineAdmin,
      attrs: isVirtualMachineAdminAttrs,
    },
  };
  // ============================================================================
  // 初期値の反映 (Watch)
  // ============================================================================
  watch(
    [() => props.data, () => props.show],
    ([userData, show]) => {
      if (show && userData) {
        resetForm({
          values: {
            name: userData.name,
            email: userData.email,

            // クォータ: UserServerBase のプロパティを使用
            maxCpuCore: userData.maxCpuCore ?? undefined,
            maxMemorySize: userData.maxMemorySize
              ? convertByteToUnit(userData.maxMemorySize, "MB")
              : undefined,
            maxStorageSize: userData.maxStorageSize
              ? convertByteToUnit(userData.maxStorageSize, "GB")
              : undefined,

            // 権限
            isAdmin: userData.isAdmin,
            isImageAdmin: userData.isImageAdmin,
            isInstanceTypeAdmin: userData.isInstanceTypeAdmin,
            isNetworkAdmin: userData.isNetworkAdmin,
            isNodeAdmin: userData.isNodeAdmin,
            isSecurityGroupAdmin: userData.isSecurityGroupAdmin,
            isVirtualMachineAdmin: userData.isVirtualMachineAdmin,
          },
        });
      }
    },
    { immediate: true, deep: true }
  );

  // ============================================================================
  // Submission Handler (送信処理)
  // ============================================================================
  const onFormSubmit = (emit: any) =>
    handleFormSubmit<UserPutRequest, UserResponse>(
      handleSubmit,
      {
        execute: async (formValues) => {
          const payload: UserPutRequest = {
            name: formValues.name,
            email: formValues.email,
            maxCpuCore: formValues.maxCpuCore || null,
            maxMemorySize: formValues.maxMemorySize
              ? convertUnitToByte(formValues.maxMemorySize, "MB")
              : null,
            maxStorageSize: formValues.maxStorageSize
              ? convertUnitToByte(formValues.maxStorageSize, "GB")
              : null,
            isAdmin: formValues.isAdmin,
            isImageAdmin: formValues.isImageAdmin,
            isInstanceTypeAdmin: formValues.isInstanceTypeAdmin,
            isNetworkAdmin: formValues.isNetworkAdmin,
            isNodeAdmin: formValues.isNodeAdmin,
            isSecurityGroupAdmin: formValues.isSecurityGroupAdmin,
            isVirtualMachineAdmin: formValues.isVirtualMachineAdmin,
          };

          return await executeUpdate(props.data ? props.data.id : "", payload);
        },
        onSuccessMessage: (payload) =>
          `利用者「${payload.name}」の情報を更新しました。`,
        onSuccess: () => resetForm(),
      },
      emit
    );

  // ★ Close ハンドラーのファクトリ
  const makeHandleClose = (emit: any) => createHandleClose(resetForm, emit);

  return {
    errors,
    name,
    nameAttrs,
    email,
    emailAttrs,
    maxCpuCore,
    maxCpuCoreAttrs,
    maxMemorySize,
    maxMemorySizeAttrs,
    maxStorageSize,
    maxStorageSizeAttrs,
    permissions,
    // 状態
    isValid: computed(() => meta.value.valid),
    isUpdating,
    onFormSubmit,
    makeHandleClose,
  };
}
