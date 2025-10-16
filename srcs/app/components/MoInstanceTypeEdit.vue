<template>
  <BaseModal
    :show="show"
    title="インスタンスタイプの編集"
    @close="$emit('close')"
  >
    <form v-if="values" @submit.prevent="onSubmit" class="modal-space">
      <FormInput
        label="インスタンスタイプ名"
        name="instance-type-name-edit"
        type="text"
        placeholder="例: standard.xlarge"
        v-model="name"
        v-model:attrs="nameAttrs"
        :error="errors.name"
      />

      <FormInput
        label="CPUコア数"
        name="instance-vcpu-edit"
        type="number"
        placeholder="例: 16"
        v-model.number="cpuCores"
        v-model:attrs="cpuCoresAttrs"
        :error="errors.cpuCores"
      />

      <FormInput
        label="メモリ数"
        name="instance-memory-edit"
        type="number"
        placeholder="例: 32"
        v-model.number="memorySize"
        v-model:attrs="memorySizeAttrs"
        :error="errors.memorySize"
      >
        <template #suffix>
          <span class="font-semibold text-gray-600">GB</span>
        </template>
      </FormInput>
    </form>
    <div v-else class="text-center">
      <p>編集するデータを読み込めませんでした。</p>
    </div>

    <template #footer>
      <div class="flex justify-end w-full">
        <button
          @click="onSubmit"
          class="btn btn-primary"
          :disabled="isUpdating"
        >
          {{ isUpdating ? "保存中..." : "保存" }}
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { watch, type PropType } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";

// --- Props & Emits ---
const props = defineProps({
  show: { type: Boolean, required: true },
  instanceTypeData: {
    type: Object as PropType<ModelInstanceTypeDTO | null>,
    default: null,
  },
});
const emit = defineEmits(["close", "success"]);

// --- Composables ---
const { executeUpdate, isUpdating } = useResourceUpdate<any, any>(
  "instance-types"
);
const { addToast } = useToast();

// ★ 1. Zodでバリデーションスキーマを定義
const validationSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, "インスタンスタイプ名は必須です。"),
    cpuCores: z
      .number({ required_error: "CPUコア数は必須です。" })
      .int()
      .min(1),
    memorySize: z
      .number({ required_error: "メモリ数は必須です。" })
      .int()
      .min(1),
  })
);

// ★ 2. vee-validateのuseFormをセットアップ
const { errors, defineField, values, resetForm, handleSubmit } = useForm({
  validationSchema,
});
const [name, nameAttrs] = defineField("name");
const [cpuCores, cpuCoresAttrs] = defineField("cpuCores");
const [memorySize, memorySizeAttrs] = defineField("memorySize");

// ★ 3. 親から渡されるデータが変更されたら、vee-validateのフォームをリセットして値を反映
watch(
  () => props.instanceTypeData,
  (newData) => {
    if (newData) {
      resetForm({
        values: { ...newData },
      });
    }
  },
  { immediate: true }
);

// ★ 4. handleSubmitでラップして、バリデーション通過時のみAPIを呼ぶ
const onSubmit = handleSubmit(async (formValues) => {
  if (!props.instanceTypeData) return;

  const result = await executeUpdate(props.instanceTypeData.id, formValues);

  if (result.success) {
    addToast({
      type: "success",
      message: `'${result.data?.name}' の更新に成功しました。`,
    });
    emit("success");
  } else {
    addToast({
      type: "error",
      message: "更新に失敗しました。",
      details: result.error?.message,
    });
  }
});
</script>
