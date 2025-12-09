<template>
  <div class="modal-space space-y-4">
    <FormInput
      label="仮想マシン名"
      name="vm-name"
      type="text"
      placeholder="例: vm-middleware01"
      :required="true"
      :error="errors.name"
      v-model="name"
      v-bind="nameAttrs"
    />

    <FormSelect
      label="ノード"
      name="node-select"
      :options="nodes ?? []"
      option-label="name"
      option-value="id"
      :pending="pending"
      :error="error"
      placeholder="ノードを選択してください"
      :required="true"
      :error-message="errors.nodeId"
      v-model="nodeId"
      v-bind="nodeIdAttrs"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * 概要タブ (TabGeneral.vue)
 * ---------------------------------------------------------------------------------
 * 仮想マシン作成ウィザードの最初のタブ。
 * 仮想マシン名や配置先ノードといった基本情報を入力します。
 * =================================================================================
 */
import { useResourceList } from "~/composables/useResourceList";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";

// 共通コンポーネントのインポート (自動インポートされない場合のために念のため記述)
import FormInput from "~/components/Form/Input.vue";
import FormSelect from "~/components/Form/Select.vue";

// 型定義 (自動インポート)
// type NodeResponse

/**
 * ==============================================================================
 * Validation Schema
 * ==============================================================================
 */
const validationSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, "仮想マシン名は必須です。"),
    nodeId: z
      .string({ message: "ノードを選択してください。" })
      .min(1, "ノードを選択してください。"),
  })
);

/**
 * ==============================================================================
 * Form State Management
 * ==============================================================================
 */
const { errors, defineField, values, meta } = useForm({
  validationSchema,
  initialValues: {
    name: "",
    nodeId: undefined,
  },
});

// 各フィールドの定義
const [name, nameAttrs] = defineField("name");
const [nodeId, nodeIdAttrs] = defineField("nodeId");

/**
 * ==============================================================================
 * API Data Fetching
 * ==============================================================================
 */
const { data: nodes, pending, error } = useResourceList<NodeResponse>("nodes");

/**
 * ==============================================================================
 * Expose to Parent
 * ------------------------------------------------------------------------------
 * 親コンポーネント (MoVirtualMachineCreate) がデータを吸い上げるために公開
 * ==============================================================================
 */
defineExpose({
  formData: values,
  isValid: meta,
});
</script>

<style scoped>
.modal-space {
  @apply p-1;
}
</style>
