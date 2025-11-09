<template>
  <BaseModal :show="show" title="イメージ編集" @close="$emit('close')">
    <div class="modal-space">
      <FormInput
        label="イメージ名"
        name="image-name-edit"
        type="text"
        v-model="name"
        v-model:attrs="nameAttrs"
        :error="errors.name"
      />

      <FormInput
        label="サイズ (GB)"
        name="image-size-edit"
        type="number"
        :model-value="size"
        disabled
      />

      <FormTextarea
        label="説明"
        name="image-description-edit"
        :rows="4"
        v-model="description"
        v-model:attrs="descriptionAttrs"
        :error="errors.description"
      />
    </div>
    <template #footer>
    <div class="modal-footer">
      <button @click="onSubmit" class="btn btn-primary">保存</button>
    </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { watch } from "vue";
import { useToast } from "~/composables/useToast";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";

// --- 親コンポーネントとの連携 ---
const props = defineProps({
  show: { type: Boolean, required: true },
  imageData: { type: Object, default: null },
});
const emit = defineEmits(["close", "save"]);

// ★ 1. Zodでバリデーションスキーマを定義
const validationSchema = toTypedSchema(
  z.object({
    id: z.string(),
    name: z.string().min(1, "イメージ名は必須です。"),
    description: z.string().nullable(),
    size: z.number(),
  })
);

// ★ 2. vee-validateのuseFormをセットアップ
const { errors, defineField, values, meta, resetForm, handleSubmit } = useForm({
  validationSchema,
});
const [id] = defineField("id");
const [name, nameAttrs] = defineField("name");
const [description, descriptionAttrs] = defineField("description");
const [size] = defineField("size");

const { addToast } = useToast();

// ★ 3. 親からデータが渡されたら、vee-validateのフォームをリセットして値をセット
watch(
  () => props.imageData,
  (newData) => {
    if (newData) {
      resetForm({
        values: {
          id: newData.id,
          name: newData.name,
          description: newData.description,
          size: (newData.size || 0) / 1024 ** 3, // バイト to GB
        },
      });
    }
  },
  { immediate: true }
);

// ★ 4. handleSubmitでラップして、バリデーション通過時のみAPIを呼ぶ
const onSubmit = handleSubmit(async (updatedValues) => {
  const payload = {
    name: updatedValues.name,
    description: updatedValues.description,
  };

  console.log("APIに送信する更新データ:", payload);
  // --- ここに実際のAPI呼び出しロジックを実装 ---
  // const { data, error } = await useApiFetch(...)

  addToast({
    message: `【ダミー】イメージ「${updatedValues.name}」を更新しました。`,
    type: "success",
  });
  emit("save", updatedValues);
  emit("close");
});
</script>
