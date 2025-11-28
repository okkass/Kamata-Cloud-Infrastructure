<template>
  <div class="space-y-4">
    <div>
      <label for="vm-edit-name" class="form-label">
        仮想マシン名 <span class="required-asterisk">*</span>
      </label>
      <input
        type="text"
        id="vm-edit-name"
        v-model="name"
        v-bind="nameAttrs"
        class="form-input"
        :class="{ 'form-border-error': errors.name }"
        placeholder="例: vm-middleware01"
      />
      <p v-if="errors.name" class="text-error mt-1">
        {{ errors.name }}
      </p>
    </div>

    <div>
      <FormSelect
        label="ノード選択"
        name="vm-edit-node"
        v-model="nodeId"
        :options="nodes ?? []"
        option-value="id"
        option-label="name"
        placeholder="ノードを選択してください"
        :pending="pending"
        :error="error"
        :error-message="errors.nodeId"
        :required="true"
        :placeholder-value="undefined"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * VM編集モーダル: 概要タブ (VmEditTabGeneral.vue)
 * ---------------------------------------------------------------------------------
 * 親 (MoVirtualMachineEdit) から initialData を props で受け取り、
 * VeeValidate の初期値に設定します。
 * =================================================================================
 */
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";
// ★ useResourceList.ts をインポート
import { useResourceList } from "~/composables/useResourceList";
// ★ 型定義をインポート
import type { NodeDTO } from "~~/shared/types/node";

// =============================================================================
// Props (初期値受け取り)
// =============================================================================
// ★ 1. 親コンポーネントから初期値を受け取る
const props = defineProps<{
  initialData: {
    name: string;
    nodeId: string | null;
  };
}>();

// =============================================================================
// Data Fetching (ノード一覧)
// =============================================================================
// ★ 2. ノード一覧をAPIから取得 (変更なし)
const { data: nodes, pending, error } = useResourceList<NodeDTO>("nodes");

// =============================================================================
// Validation Schema (バリデーション定義)
// =============================================================================
// ★ 3. バリデーション定義 (変更なし)
const validationSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, "仮想マシン名は必須です。"),
    nodeId: z.string({ required_error: "ノードを選択してください。" }),
  })
);

// =============================================================================
// Form Setup (VeeValidate)
// =============================================================================
// ★ 4. フォームのセットアップ
const { errors, defineField, values, meta, validate } = useForm({
  validationSchema,
  /**
   * ★ 5. 初期値を props.initialData から設定
   * 親 (MoVirtualMachineEdit) が v-if="vmData" で描画制御しているため、
   * このコンポーネントがマウントされる時点で props.initialData は
   * 確定した値 (name, nodeId) を持っています。
   */
  initialValues: {
    name: props.initialData.name,
    // nodeId が null の場合は undefined に変換し、FormSelect の placeholder と合わせる
    nodeId: props.initialData.nodeId ?? undefined,
  },
});

// v-model と v-bind 用のヘルパー (変更なし)
const [name, nameAttrs] = defineField("name");
const [nodeId] = defineField("nodeId");

// =============================================================================
// Expose (親へのインターフェース公開)
// =============================================================================
// ★ 6. 親 (useVirtualMachineEdit) が必要とするものを公開 (変更なし)
defineExpose({
  validate, // バリデーション関数
  values, // フォームの現在の値
  meta, // フォームのメタ情報 (meta.valid を親が参照)
});
</script>
