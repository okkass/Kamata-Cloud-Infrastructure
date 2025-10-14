<template>
  <BaseModal
    :show="show"
    title="インスタンスタイプの追加"
    @close="$emit('close')"
  >
    <form @submit.prevent="onFormSubmit" class="modal-space">
      <div>
        <label for="instance-type-name" class="form-label">
          インスタンスタイプ名 <span class="required-asterisk">*</span>
        </label>
        <input
          id="instance-type-name"
          type="text"
          placeholder="例: standard.xlarge"
          v-model="name"
          v-bind="nameAttrs"
          class="form-input"
          :class="{ 'form-border-error': errors.name }"
        />
        <p v-if="errors.name" class="text-error mt-1">{{ errors.name }}</p>
      </div>

      <div>
        <label for="instance-cpu-cores" class="form-label">
          CPUコア数 <span class="required-asterisk">*</span>
        </label>
        <input
          id="instance-cpu-cores"
          type="number"
          placeholder="例: 16"
          v-model.number="cpuCores"
          v-bind="cpuCoresAttrs"
          class="form-input"
          :class="{ 'form-border-error': errors.cpuCores }"
        />
        <p v-if="errors.cpuCores" class="text-error mt-1">
          {{ errors.cpuCores }}
        </p>
      </div>

      <div>
        <label for="instance-memory" class="form-label">
          メモリサイズ <span class="required-asterisk">*</span>
        </label>
        <div class="flex">
          <input
            id="instance-memory"
            type="number"
            placeholder="例: 32768"
            v-model.number="memorySizeInMb"
            v-bind="memorySizeInMbAttrs"
            class="form-input rounded-r-none"
            :class="{ 'form-border-error': errors.memorySizeInMb }"
          />
          <span class="form-unit-label">MB</span>
        </div>
        <p v-if="errors.memorySizeInMb" class="text-error mt-1">
          {{ errors.memorySizeInMb }}
        </p>
      </div>

      <div class="modal-footer">
        <button type="submit" class="btn btn-primary" :disabled="isCreating">
          {{ isCreating ? "作成中..." : "作成" }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * インスタンスタイプ追加モーダル (MoInstanceTypeAdd.vue)
 * ---------------------------------------------------------------------------------
 * このコンポーネントは、新しいインスタンスタイプ（CPU、メモリの組み合わせ）を
 * 作成するためのUIと機能を提供します。
 * =================================================================================
 */
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useResourceCreate } from "~/composables/useResourceCreate";
import { useToast } from "~/composables/useToast";

// --- 親コンポーネントとの連携 ---
defineProps({ show: { type: Boolean, required: true } });
const emit = defineEmits(["close", "success"]);

// ==============================================================================
// Type Definitions
// APIとの通信で使用するデータの型を定義します。
// ==============================================================================
// POST /api/instance-type で送信するリクエストボディの型
interface InstanceTypeCreateRequestDTO {
  name: string;
  cpuCores: number;
  memorySize: number; // APIへはバイト単位で送信
}
// POST成功後に返される、作成済みインスタンスタイプの型
interface ModelInstanceTypeDTO {
  id: string;
  name: string;
  // ...
}

// ==============================================================================
// Validation Schema
// フォームのバリデーションルールをZodで定義します。
// ==============================================================================
const validationSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, "インスタンスタイプ名は必須です。"),
    cpuCores: z
      .number({
        required_error: "CPUコア数は必須です。",
        invalid_type_error: "数値を入力してください。",
      })
      .int("整数で入力してください。")
      .min(1, "1以上の値を入力してください。"),
    memorySizeInMb: z
      .number({
        required_error: "メモリサイズは必須です。",
        invalid_type_error: "数値を入力してください。",
      })
      .int("整数で入力してください。")
      .min(1, "1MB以上の値を入力してください。"),
  })
);

// ==============================================================================
// Form Setup
// VeeValidateのuseFormを使って、フォームの状態管理をセットアップします。
// `handleSubmit` を利用することで、バリデーション通過時のみ実行される関数を安全に定義できます。
// ==============================================================================
const { errors, defineField, handleSubmit } = useForm({
  validationSchema,
  initialValues: {
    cpuCores: 1,
    memorySizeInMb: 1024,
  },
});

const [name, nameAttrs] = defineField("name");
const [cpuCores, cpuCoresAttrs] = defineField("cpuCores");
const [memorySizeInMb, memorySizeInMbAttrs] = defineField("memorySizeInMb");

// ==============================================================================
// API Submission
// ==============================================================================
const { executeCreate: executeInstanceTypeCreation, isCreating } =
  useResourceCreate<InstanceTypeCreateRequestDTO, ModelInstanceTypeDTO>(
    "instance-types"
  );

const { addToast } = useToast();

// ==============================================================================
// Event Handler
// ==============================================================================

/**
 * フォームが送信されたときに実行されるハンドラ。
 * VeeValidateの`handleSubmit`でラップされており、バリデーションが通過した場合のみ呼び出されます。
 * @param {object} formValues - バリデーション済みのフォーム入力値
 */
const onFormSubmit = handleSubmit(async (formValues) => {
  // APIに送信するデータ（ペイロード）を構築します。
  // メモリサイズはMBからByteに変換します。
  const payload: InstanceTypeCreateRequestDTO = {
    name: formValues.name,
    cpuCores: formValues.cpuCores,
    memorySize: formValues.memorySizeInMb * 1024 * 1024, // MB to Bytes
  };

  // APIリクエストを実行します。
  const result = await executeInstanceTypeCreation(payload);

  // 結果に応じてトースト通知を表示します。
  if (result.success) {
    addToast({
      type: "success",
      message: `インスタンスタイプ「${payload.name}」が作成されました`,
    });
    emit("success"); // 親コンポーネントに成功を通知
    emit("close"); // モーダルを閉じる
  } else {
    addToast({
      type: "error",
      message: "作成に失敗しました。",
      details: result.error?.message,
    });
  }
});
</script>
