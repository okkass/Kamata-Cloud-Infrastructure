<template>
  <BaseModal :show="show" title="利用者の追加" @close="$emit('close')">
    <form @submit.prevent="onSubmit" class="modal-space">
      <FormInput
        label="アカウント名"
        name="user-account-name-add"
        type="text"
        v-model="name"
        v-model:attrs="nameAttrs"
        :error="errors.name"
      />

      <FormInput
        label="メールアドレス"
        name="user-email-add"
        type="email"
        v-model="email"
        v-model:attrs="emailAttrs"
        :error="errors.email"
      />

      <FormInput
        label="パスワード"
        name="user-password-add"
        type="password"
        v-model="password"
        v-model:attrs="passwordAttrs"
        :error="errors.password"
      />

      <FormSection title="リソース制限">
        <div class="space-y-2">
          <FormInput
            name="user-max-cpu"
            label="CPUコア数"
            type="number"
            placeholder="最大CPU数"
            v-model.number="maxCpuCores"
            v-model:attrs="maxCpuCoresAttrs"
            :error="errors.maxCpuCores"
          >
            <template #suffix>
              <span class="form-unit-label">vCPU</span>
            </template>
          </FormInput>

          <FormInput
            name="user-max-memory"
            label="メモリ (MB)"
            type="number"
            placeholder="最大メモリ数"
            v-model.number="maxMemorySize"
            v-model:attrs="maxMemorySizeAttrs"
            :error="errors.maxMemorySize"
          >
            <template #suffix>
              <span class="form-unit-label">MB</span>
            </template>
          </FormInput>

          <FormInput
            name="user-max-storage"
            label="ストレージ (GB)"
            type="number"
            placeholder="最大ストレージ数"
            v-model.number="maxStorageSize"
            v-model:attrs="maxStorageSizeAttrs"
            :error="errors.maxStorageSize"
          >
            <template #suffix>
              <span class="form-unit-label">GB</span>
            </template>
          </FormInput>
        </div>
      </FormSection>
    </form>

    <template #footer>
      <div class="flex justify-end w-full">
        <button @click="onSubmit" class="btn btn-primary">追加</button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";

// --- Props & Emits ---
defineProps({ show: { type: Boolean, required: true } });
const emit = defineEmits(["close", "add"]);

// --- Composables ---
const { executeCreate, isCreating } = useResourceCreate<any, any>("users");
const { addToast } = useToast();

// ★ 1. Zodでバリデーションスキーマを定義
const validationSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, "アカウント名は必須です。"),
    email: z.string().email("有効なメールアドレスを入力してください。"),
    password: z.string().min(8, "パスワードは8文字以上で入力してください。"),
    maxCpuCores: z.preprocess(
      (val) => (val === "" ? null : val),
      z.number().int().min(1).nullable()
    ),
    maxMemorySize: z.preprocess(
      (val) => (val === "" ? null : val),
      z.number().int().min(1).nullable()
    ),
    maxStorageSize: z.preprocess(
      (val) => (val === "" ? null : val),
      z.number().int().min(1).nullable()
    ),
  })
);

// ★ 2. vee-validateのuseFormをセットアップ
const { errors, defineField, handleSubmit } = useForm({
  validationSchema,
  initialValues: {
    name: "",
    email: "",
    password: "",
    maxCpuCores: null,
    maxMemorySize: null,
    maxStorageSize: null,
  },
});
const [name, nameAttrs] = defineField("name");
const [email, emailAttrs] = defineField("email");
const [password, passwordAttrs] = defineField("password");
const [maxCpuCores, maxCpuCoresAttrs] = defineField("maxCpuCores");
const [maxMemorySize, maxMemorySizeAttrs] = defineField("maxMemorySize");
const [maxStorageSize, maxStorageSizeAttrs] = defineField("maxStorageSize");

// ★ 3. handleSubmitでラップして、バリデーション通過時のみAPIを呼ぶ
const onSubmit = handleSubmit(async (values) => {
  const payload = {
    ...values,
    useTOTP: false,
    isAdmin: false,
    maxMemorySize: values.maxMemorySize
      ? convertUnitToByte(values.maxMemorySize, "GB")
      : null,
    maxStorageSize: values.maxStorageSize
      ? convertUnitToByte(values.maxStorageSize, "GB")
      : null,
  };

  const result = await executeCreate(payload);

  if (result.success) {
    addToast({
      message: `利用者「${result.data?.name}」を追加しました。`,
      type: "success",
    });
    emit("add", result.data);
    emit("close");
  } else {
    addToast({
      message: "ユーザーの作成に失敗しました。",
      type: "error",
      details: result.error?.message,
    });
  }
});
</script>