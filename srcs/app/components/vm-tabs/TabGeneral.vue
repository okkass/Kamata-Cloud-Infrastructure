<template>
  <div class="modal-space">
    <div>
      <label for="vm-name" class="form-label">
        仮想マシン名 <span class="required-asterisk">*</span>
      </label>
      <input
        type="text"
        id="vm-name"
        v-model="name"
        v-bind="nameAttrs"
        class="form-input"
        :class="{ 'form-border-error': errors.name }"
        placeholder="例: vm-middleware01"
      />
      <p v-if="errors.name" class="text-error mt-1">{{ errors.name }}</p>
    </div>

    <div>
      <label for="node-select" class="form-label">
        ノード <span class="required-asterisk">*</span>
      </label>
      <div v-if="pending" class="text-loading">読み込み中...</div>
      <div v-else-if="error" class="text-error">取得に失敗しました。</div>
      <select
        v-else
        id="node-select"
        v-model="nodeId"
        v-bind="nodeIdAttrs"
        class="form-input"
        :class="{ 'form-border-error': errors.nodeId }"
      >
        <option :value="undefined" disabled>ノードを選択してください</option>
        <option v-for="node in nodes" :key="node.id" :value="node.id">
          {{ node.name }}
        </option>
      </select>
      <p v-if="errors.nodeId" class="text-error mt-1">{{ errors.nodeId }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useResourceList } from "~/composables/useResourceList";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";

// ==============================================================================
// Type Definitions
// APIから取得するデータの型を定義します。
// ==============================================================================
interface PhysicalNodeDTO {
  id: string;
  name: string;
}

// ==============================================================================
// Validation Schema
// フォームのバリデーションルールをZodで定義します。
// ==============================================================================
const validationSchema = toTypedSchema(
  z.object({
    // `name` (仮想マシン名) は1文字以上の文字列であることが必須です。
    name: z.string().min(1, "仮想マシン名は必須です。"),
    // `nodeId` (ノードID) は文字列であり、選択が必須です。
    nodeId: z.string({ required_error: "ノードを選択してください。" }),
  })
);

// ==============================================================================
// Form Setup
// VeeValidateのuseFormを使って、フォームの状態管理をセットアップします。
// ==============================================================================
const { errors, defineField, values, meta } = useForm({
  validationSchema,
  // initialValuesは親コンポーネントからセットされるため、ここでは空にしておきます。
});

// `defineField`を使って、各フォームフィールドとVeeValidateを連携させます。
const [name, nameAttrs] = defineField("name");
const [nodeId, nodeIdAttrs] = defineField("nodeId");

// 親コンポーネント(MoVirtualMachineCreate)がこのタブのデータと状態を参照できるように公開します。
defineExpose({
  formData: values,
  isValid: meta,
});

// ==============================================================================
// API Data Fetching
// `useResourceList` Composableを使って、プルダウンの選択肢をAPIから取得します。
// ==============================================================================
const {
  data: nodes,
  pending,
  error,
} = useResourceList<PhysicalNodeDTO>("physical-node");
</script>
