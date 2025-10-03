<template>
  <div class="space-y-4">
    <div>
      <label for="vm-name" class="form-label">仮想マシン名</label>
      <input
        type="text"
        id="vm-name"
        v-model="name"
        v-bind="nameAttrs"
        class="form-input"
        :class="{ 'border-red-500 focus:ring-red-500': errors.name }"
        placeholder="例: vm-middleware01"
      />
      <p v-if="errors.name" class="text-red-500 text-sm mt-1">
        {{ errors.name }}
      </p>
    </div>

    <div>
      <label for="node-select" class="form-label">ノード選択</label>
      <div v-if="pending" class="text-gray-500">ノード一覧を読み込み中...</div>
      <div v-else-if="error" class="text-red-500">
        ノード一覧の取得に失敗しました。
      </div>
      <select
        v-else
        id="node-select"
        v-model="nodeId"
        v-bind="nodeIdAttrs"
        class="form-input"
        :class="{ 'border-red-500 focus:ring-red-500': errors.nodeId }"
      >
        <option :value="undefined" disabled>ノードを選択してください</option>
        <option v-for="node in nodes" :key="node.id" :value="node.id">
          {{ node.name }}
        </option>
      </select>
      <p v-if="errors.nodeId" class="text-red-500 text-sm mt-1">
        {{ errors.nodeId }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useResourceList } from "~/composables/useResourceList";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";

// (型定義は変更なし)
interface ModelPhysicalNodeDTO {
  id: string;
  name: string;
}

// (Zodスキーマ定義は変更なし)
const validationSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, "仮想マシン名は必須です。"),
    nodeId: z.string({ required_error: "ノードを選択してください。" }),
  })
);

// (useFormのセットアップは変更なし)
const { errors, defineField, values, meta } = useForm({
  validationSchema,
});
const [name, nameAttrs] = defineField("name");
const [nodeId, nodeIdAttrs] = defineField("nodeId");

// (defineExposeは変更なし)
defineExpose({
  formData: values,
  isValid: meta,
});

// (API連携は変更なし)
const {
  data: nodes,
  pending,
  error,
} = useResourceList<ModelPhysicalNodeDTO>("physical-node");
</script>

<style scoped>
/* (スタイルは変更なし) */
.form-label {
  @apply block mb-1.5 font-semibold text-gray-700;
}
.form-input {
  @apply w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500;
}
</style>
