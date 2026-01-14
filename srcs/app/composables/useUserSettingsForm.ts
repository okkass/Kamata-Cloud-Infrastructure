import { computed, watch, ref, type Ref } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import {
  UserClientUpdateSchema,
  type UserClientUpdateInput,
} from "~/utils/validations/user";
import { useToast } from "~/composables/useToast";
import { useUserPermission } from "~/composables/useUserPermission";
import { extractErrorMessage } from "~/utils/errorHandler";
import type { PasswordChangeRequest, UserResponse } from "~~/shared/types";
import { useApiClient } from "~/composables/useResourceClient";

type PropsLike = {
  data: Ref<UserResponse | null>;
};

/**
 * パスワード変更の意図を判定
 * 現在のパスワード、新しいパスワード、または確認用パスワードのいずれかが空でない場合、true を返す
 */
export const hasPasswordChangeIntent = (
  cpValue: string | null | undefined,
  npValue: string | null | undefined,
  ncValue: string | null | undefined
): boolean => {
  const currentPwd = (cpValue ?? "").trim();
  const newPwd = (npValue ?? "").trim();
  const newPwdConfirm = (ncValue ?? "").trim();
  return currentPwd !== "" || newPwd !== "" || newPwdConfirm !== "";
};

/**
 * エラーメッセージを抽出する（型安全）
 */
const getErrorMessage = (
  error: unknown,
  defaultMessage: string = "更新に失敗しました。"
): string => {
  return extractErrorMessage(error, defaultMessage);
};

export const useUserSettingsForm = (props: PropsLike) => {
  const { addToast } = useToast();
  const isUpdating = ref(false);
  const client = useApiClient();
  const { user } = useUserPermission();

  const { errors, meta, defineField, handleSubmit, resetForm } =
    useForm<UserClientUpdateInput>({
      validationSchema: toTypedSchema(UserClientUpdateSchema),
      initialValues: {
        name: props.data.value?.name ?? "",
        email: props.data.value?.email ?? "",
        currentPassword: "",
        newPassword: "",
        newPasswordConfirm: "",
      },
    });

  const isValid = computed(() => meta.value.valid);

  const [name, nameAttrs] = defineField("name");
  const [email, emailAttrs] = defineField("email");

  const [currentPassword, currentPasswordAttrs] =
    defineField("currentPassword");
  const [newPassword, newPasswordAttrs] = defineField("newPassword");
  const [newPasswordConfirm, newPasswordConfirmAttrs] =
    defineField("newPasswordConfirm");

  const wantsPasswordChange = computed(() =>
    hasPasswordChangeIntent(
      currentPassword.value,
      newPassword.value,
      newPasswordConfirm.value
    )
  );

  const buildPayload = (): {
    name: string;
    email: string;
    passwordChange?: PasswordChangeRequest;
  } => {
    const payload = {
      name: name.value,
      email: email.value,
    };

    if (wantsPasswordChange.value) {
      const passwordChange: PasswordChangeRequest = {
        currentPassword: (currentPassword.value ?? "").trim(),
        newPassword: (newPassword.value ?? "").trim(),
      };
      return { ...payload, passwordChange };
    }

    return payload;
  };

  const updateMe = async (
    payload: ReturnType<typeof buildPayload>,
    id: string
  ): Promise<void> => {
    await client.patch(`/users/${id}`, payload);
  };
  const onFormSubmit = () =>
    handleSubmit(async () => {
      try {
        isUpdating.value = true;

        const payload = buildPayload();
        await updateMe(payload, user.value?.id ?? "");

        addToast({ type: "success", message: "設定を更新しました。" });

        // 更新後：パスワード欄だけクリア（name/emailは保持）
        resetForm({
          values: {
            name: name.value,
            email: email.value,
            currentPassword: "",
            newPassword: "",
            newPasswordConfirm: "",
          },
        });
      } catch (error: unknown) {
        const msg = getErrorMessage(error);
        addToast({ type: "error", message: msg });
      } finally {
        isUpdating.value = false;
      }
    });

  // ログインユーザーが後から来ても同期
  watch(
    () => props.data.value,
    (v) => {
      if (!v) return;
      resetForm({
        values: {
          name: v.name,
          email: v.email,
          currentPassword: "",
          newPassword: "",
          newPasswordConfirm: "",
        },
      });
    },
    { immediate: true }
  );

  return {
    errors,
    isValid,

    name,
    nameAttrs,
    email,
    emailAttrs,

    currentPassword,
    currentPasswordAttrs,
    newPassword,
    newPasswordAttrs,
    newPasswordConfirm,
    newPasswordConfirmAttrs,

    wantsPasswordChange,

    isUpdating,
    onFormSubmit,
  };
};
