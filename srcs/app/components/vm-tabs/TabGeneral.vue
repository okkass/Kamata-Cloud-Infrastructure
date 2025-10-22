<template>
  <div class="modal-space">
    <FormInput
      label="仮想マシン名"
      name="vm-name"
      type="text"
      placeholder="例: vm-middleware01"
      :required="true"
      :error="errors.name"
      v-model="name"
      v-model:attrs="nameAttrs"
    />

    <FormSelect
      label="ノード"
      name="node-select"
      :pending="pending"
      :error="error"
      :options="nodes ?? []"
      placeholder="ノードを選択してください"
      :required="true"
      :error-message="errors.nodeId"
      :placeholder-value="undefined"
      v-model="nodeId"
      v-model:attrs="nodeIdAttrs"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * 概要タブ (TabGeneral.vue)
 * ---------------------------------------------------------------------------------
 * 仮想マシン作成ウィザードの最初のタブ。
 * 主に仮想マシン名や配置先ノードといった、基本的な情報を入力する役割を担います。
 * =================================================================================
 */
import { useResourceList } from "~/composables/useResourceList";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";

/**
 * ==============================================================================
 * Validation Schema (バリデーションスキーマ)
 * ------------------------------------------------------------------------------
 * このフォームの入力ルールをZodで定義します。
 * `name`と`nodeId`が必須項目であることを指定しています。
 * ==============================================================================
 */
const validationSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, "仮想マシン名は必須です。"),
    nodeId: z.string({ required_error: "ノードを選択してください。" }),
  })
);

/**
 * ==============================================================================
 * Form State Management (フォーム状態管理)
 * ------------------------------------------------------------------------------
 * VeeValidateのuseFormを使って、フォーム全体の状態を管理します。
 * これにより、入力値、エラー、バリデーション状態などがリアクティブに扱えます。
 * ==============================================================================
 */
const { errors, defineField, values, meta } = useForm({
  validationSchema,
  initialValues: {
    name: "",
    nodeId: undefined,
  },
});

// `defineField`を使い、各フォームフィールドとVeeValidateを連携させます。
// 戻り値の配列: [リアクティブな値(v-model用), 属性(v-bind用)]
const [name, nameAttrs] = defineField("name");
const [nodeId, nodeIdAttrs] = defineField("nodeId");

/**
 * ==============================================================================
 * Expose to Parent (親コンポーネントへの公開)
 * ------------------------------------------------------------------------------
 * `defineExpose`を使い、このコンポーネントのデータと状態を親から参照できるようにします。
 * 親は`tabRefs`を通じて`formData`や`isValid`にアクセスできます。
 * ==============================================================================
 */
defineExpose({
  formData: values,
  isValid: meta,
});

/**
 * ==============================================================================
 * API Data Fetching (APIデータ取得)
 * ------------------------------------------------------------------------------
 * `useResourceList` Composableを使い、「ノード選択」プルダウンの選択肢を
 * APIから非同期で取得します。
 * ==============================================================================
 */
const {
  data: nodes,
  pending,
  error,
} = useResourceList<PhysicalNodeDTO>("physical-nodes");
</script>
