import { computed, watch, ref, type Ref } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import {
  UserClientUpdateSchema,
  type UserClientUpdateInput,
} from "~/utils/validations/user";
import { useToast } from "~/composables/useToast";

type MeUser = {
  id: string;
  name: string;
  email: string;
};

type PropsLike = {
  data: Ref<MeUser | null>;
};

export const useUserSettingsForm = (props: PropsLike) => {
  const toast = useToast();
  const isUpdating = ref(false);

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

  const wantsPasswordChange = computed(() => {
    const cp = (currentPassword.value ?? "").trim();
    const np = (newPassword.value ?? "").trim();
    const nc = (newPasswordConfirm.value ?? "").trim();
    return cp !== "" || np !== "" || nc !== "";
  });

  const buildPayload = () => {
    const payload: any = {
      name: name.value,
      email: email.value,
    };

    if (wantsPasswordChange.value) {
      payload.currentPassword = (currentPassword.value ?? "").trim();
      payload.newPassword = (newPassword.value ?? "").trim();
    }

    return payload;
  };

  // ★ TODO: 実APIに差し替え
  const updateMe = async (_payload: any) => {
    // await $fetch("/api/me", { method: "PATCH", body: _payload })
    return;
  };

  const onFormSubmit = () =>
    handleSubmit(async () => {
      try {
        isUpdating.value = true;

        const payload = buildPayload();
        await updateMe(payload);

        toast.addToast({ type: "success", message: "設定を更新しました。" });

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
      } catch (e: any) {
        const msg = e?.data?.message ?? e?.message ?? "更新に失敗しました。";
        toast.addToast({ type: "error", message: msg });
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
