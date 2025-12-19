/**
 * =================================================================================
 * 利用者追加フォーム Composable (useUserAddForm.ts)
 * =================================================================================
 */
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { useResourceCreate } from "~/composables/useResourceCreate";
import { convertUnitToByte } from "~/utils/format";
import { UserSchema } from "~/utils/validations/user";
import { useFormAction } from "~/composables/modal/useModalAction";

/**
 * 利用者追加フォームのロジック
 */
export function useUserAddForm() {
  const { handleFormSubmit, makeHandleClose: createHandleClose } =
    useFormAction();

  // ★ useResourceCreate の型引数を共有型定義に変更
  // Request: UserCreateRequest, Response: UserServerBase
  const { executeCreate, isCreating } = useResourceCreate<
    UserCreateRequest,
    UserResponse
  >(USER.name);

  // ============================================================================
  // Form Setup (VeeValidate)
  // ============================================================================
  const { errors, defineField, handleSubmit, resetForm, meta } =
    useForm<UserCreateRequest>({
      validationSchema: toTypedSchema(UserSchema),
      initialValues: {
        name: "",
        email: "",
        password: "",
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
  const [password, passwordAttrs] = defineField("password");

  const [maxCpuCore, maxCpuCoreAttrs] = defineField("maxCpuCore");
  const [maxMemorySize, maxMemorySizeAttrs] = defineField("maxMemorySize");
  defineField("maxMemorySize");
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
    isAdmin: { label: "全体管理者", value: isAdmin },
    isImageAdmin: { label: "イメージ管理", value: isImageAdmin },
    isInstanceTypeAdmin: {
      label: "インスタンスタイプ管理",
      value: isInstanceTypeAdmin,
    },
    isNetworkAdmin: { label: "ネットワーク管理", value: isNetworkAdmin },
    isNodeAdmin: { label: "ノード管理", value: isNodeAdmin },
    isSecurityGroupAdmin: {
      label: "セキュリティグループ管理",
      value: isSecurityGroupAdmin,
    },
    isVirtualMachineAdmin: {
      label: "仮想マシン管理",
      value: isVirtualMachineAdmin,
    },
  };

  // ============================================================================
  // Submission Handler (送信処理)
  // ============================================================================
  const onFormSubmit = (emit: any) =>
    handleFormSubmit<UserCreateRequest, UserResponse>(
      handleSubmit,
      {
        execute: async (formValues) => {
          const payload: UserCreateRequest = {
            name: formValues.name,
            email: formValues.email,
            password: formValues.password,
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

          return await executeCreate(payload);
        },
        onSuccessMessage: (payload) =>
          `利用者「${payload.name}」を作成しました。`,
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
    password,
    passwordAttrs,
    maxCpuCore,
    maxCpuCoreAttrs,
    maxMemorySize,
    maxMemorySizeAttrs,
    maxStorageSize,
    maxStorageSizeAttrs,
    // 権限
    permissions,
    // 状態
    isValid: computed(() => meta.value.valid),
    isCreating,
    onFormSubmit,
    makeHandleClose,
  };
}
