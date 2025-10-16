<template>
  <BaseModal :show="show" title="利用者の追加" @close="$emit('close')">
    <form @submit.prevent="onFormSubmit" class="modal-space">
      <div>
        <label for="user-account-name-add" class="form-label">
          アカウント名 <span class="required-asterisk">*</span>
        </label>
        <input
          id="user-account-name-add"
          type="text"
          v-model="name"
          v-bind="nameAttrs"
          class="form-input"
          :class="{ 'form-border-error': errors.name }"
        />
        <p v-if="errors.name" class="text-error mt-1">{{ errors.name }}</p>
      </div>

      <div>
        <label for="user-email-add" class="form-label">
          メールアドレス <span class="required-asterisk">*</span>
        </label>
        <input
          id="user-email-add"
          type="email"
          v-model="email"
          v-bind="emailAttrs"
          class="form-input"
          :class="{ 'form-border-error': errors.email }"
        />
        <p v-if="errors.email" class="text-error mt-1">{{ errors.email }}</p>
      </div>

      <div>
        <label for="user-password-add" class="form-label">
          パスワード <span class="required-asterisk">*</span>
        </label>
        <input
          id="user-password-add"
          type="password"
          v-model="password"
          v-bind="passwordAttrs"
          class="form-input"
          :class="{ 'form-border-error': errors.password }"
        />
        <p v-if="errors.password" class="text-error mt-1">
          {{ errors.password }}
        </p>
      </div>

      <FormSection title="リソース制限">
        <div class="space-y-2">
          <FormInput
            name="user-max-cpu"
            label="CPUコア数"
            type="number"
            placeholder="無制限"
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
            placeholder="無制限"
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
            placeholder="無制限"
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

      <div class="modal-footer">
        <button type="submit" class="btn btn-primary" :disabled="isCreating">
          {{ isCreating ? "追加中..." : "追加" }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * 利用者追加モーダル (MoUserAdd.vue)
 * ---------------------------------------------------------------------------------
 * このコンポーネントは、新しい利用者アカウントを作成するためのUIと機能を提供します。
 * =================================================================================
 */
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";

// --- 親コンポーネントとの連携 ---
defineProps({ show: { type: Boolean, required: true } });
const emit = defineEmits(["close", "success"]);

// ==============================================================================
// Type Definitions
// ==============================================================================
// POST /api/users で送信するリクエストボディの型
interface UserCreateRequestDTO {
  name: string;
  email: string;
  password: string;
  useTOTP: boolean;
  isAdmin: boolean;
  maxCpuCore: number | null; // API仕様では単数形
  maxMemorySize: number | null;
  maxStorageSize: number | null;
}
// POST成功後に返される、作成済みユーザーの型
interface UserDTO {
  id: string;
  name: string;
  // ...
}

// ==============================================================================
// Validation Schema
// ==============================================================================
const zodSchema = z.object({
  name: z.string().min(1, "アカウント名は必須です。"),
  email: z.string().email("有効なメールアドレスを入力してください。"),
  password: z.string().min(8, "パスワードは8文字以上で入力してください。"),
  // preprocessで空文字をnullに変換
  maxCpuCores: z.preprocess(
    (val) => (val === "" ? null : val),
    z
      .number()
      .int("整数で入力してください")
      .min(1, "1以上の値を入力してください")
      .nullable()
  ),
  maxMemorySize: z.preprocess(
    (val) => (val === "" ? null : val),
    z
      .number()
      .int("整数で入力してください")
      .min(1, "1以上の値を入力してください")
      .nullable()
  ),
  maxStorageSize: z.preprocess(
    (val) => (val === "" ? null : val),
    z
      .number()
      .int("整数で入力してください")
      .min(1, "1以上の値を入力してください")
      .nullable()
  ),
});

const validationSchema = toTypedSchema(zodSchema);
type FormValues = z.infer<typeof zodSchema>;

// ==============================================================================
// Form Setup
// ==============================================================================
const { errors, defineField, handleSubmit } = useForm<FormValues>({
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
// フォームのフィールド名はAPIと異なっていてもOK (後でマッピングするため)
const [maxCpuCores, maxCpuCoresAttrs] = defineField("maxCpuCores");
const [maxMemorySize, maxMemorySizeAttrs] = defineField("maxMemorySize");
const [maxStorageSize, maxStorageSizeAttrs] = defineField("maxStorageSize");

// ==============================================================================
// API Submission
// ==============================================================================
const { executeCreate, isCreating } = useResourceCreate<
  UserCreateRequestDTO,
  UserDTO
>("users");
const { addToast } = useToast();

// ==============================================================================
// Event Handler
// ==============================================================================
const onFormSubmit = handleSubmit(async (values) => {
  // APIに送信するデータ（ペイロード）を構築
  const payload: UserCreateRequestDTO = {
    name: values.name,
    email: values.email,
    password: values.password,
    // このフォームでは一般ユーザー作成を想定し、フラグはfalseで固定
    useTOTP: false,
    isAdmin: false,
    // ★ API仕様に合わせて `maxCpuCores` -> `maxCpuCore` にマッピング
    maxCpuCore: values.maxCpuCores,
    // ★ 単位変換をフォームのラベルに合わせて MB -> Byte に修正
    maxMemorySize: values.maxMemorySize
      ? values.maxMemorySize * 1024 * 1024 // MB to Bytes
      : null,
    maxStorageSize: values.maxStorageSize
      ? values.maxStorageSize * 1024 * 1024 * 1024 // GB to Bytes
      : null,
  };

  const result = await executeCreate(payload);

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
</script>
