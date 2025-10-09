<template>
  <div class="modal-space">
    <FormInput
      label="仮想マシン名"
      name="vm-name"
      type="text"
      placeholder="例: vm-middleware01"
      :error="errors.name"
      v-model="name"
      v-model:attrs="nameAttrs"
    />

    <FormSelect
      label="ノード選択"
      name="node-select"
      :pending="pending"
      :error="error"
      :options="nodes ?? []"
      placeholder="ノードを選択してください"
      :error-message="errors.nodeId"
      :required="true"
      :placeholder-value="undefined"
      v-model="nodeId"
      v-model:attrs="nodeIdAttrs"
    />
  </div>
</template>

<script setup lang="ts">
import { useResourceList } from "~/composables/useResourceList";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";

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
} = useResourceList<PhysicalNodeDTO>("physical-node");
</script>
