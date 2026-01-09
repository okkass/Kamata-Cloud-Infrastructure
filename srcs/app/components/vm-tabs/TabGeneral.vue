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
      :columns="['ノード名', '状態']"
      grid-template-columns="2fr 1fr"
      v-model="nodeId"
      v-bind="nodeIdAttrs"
    >
      <template #option="{ option }">
        <div
          class="grid gap-4 items-center w-full"
          style="grid-template-columns: 2fr 1fr"
        >
          <div>{{ option.name }}</div>
          <div class="text-sm">
            <span :class="getNodeStatusClass(option.status)">
              {{ formatNodeStatus(option.status) }}
            </span>
          </div>
        </div>
      </template>
    </FormSelect>
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
import { vmGeneralCreateSchema } from "~/utils/validations/virtual-machine";

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
const validationSchema = toTypedSchema(vmGeneralCreateSchema);

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
const {
  data: nodes,
  pending,
  error,
} = useResourceList<NodeResponse>(NODE.name);

/**
 * ==============================================================================
 * Helper Functions
 * ==============================================================================
 */

/**
 * ノードのステータスをフォーマット
 */
const formatNodeStatus = (status: string | undefined): string => {
  if (!status) return "不明";
  const statusMap: Record<string, string> = {
    running: "実行中",
    stopped: "停止中",
    error: "エラー",
    updating: "更新中",
  };
  return statusMap[status] || status;
};

/**
 * ノードのステータスに応じたCSSクラスを取得
 */
const getNodeStatusClass = (status: string | undefined): string => {
  if (!status) return "text-gray-500";
  const classMap: Record<string, string> = {
    running: "text-green-600 font-semibold",
    stopped: "text-red-600",
    error: "text-red-700 font-semibold",
    updating: "text-yellow-600",
  };
  return classMap[status] || "text-gray-600";
};

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
