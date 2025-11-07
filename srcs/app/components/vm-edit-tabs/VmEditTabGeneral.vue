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
 * このコンポーネントは、VM編集モーダルの「概要」タブのUIとフォームロジックを
 * 自己完結して管理します。
 * * 責務:
 * 1. 自身のフォーム (VM名, ノード) の状態とバリデーション (VeeValidate) を管理する。
 * 2. フォームに必要なデータ (ノード一覧) をAPI (useResourceList) から取得する。
 * 3. 親コンポーネント (MoVirtualMachineEdit) が
 * フォームの初期化 (resetForm), 検証 (validate), 値の収集 (values, meta) が
 * できるように、`defineExpose` でインターフェースを公開する。
 * =================================================================================
 */
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useResourceList } from "~/composables/useResourceList";
// ★ 共通コンポーネントをインポート
import FormSelect from "~/components/FormSelect.vue";
// ★ 共有型定義をインポート
import type { PhysicalNodeDTO } from "~~/shared/types/physical-nodes";

// ==============================================================================
// API (ノード一覧取得)
// ==============================================================================
const {
  data: nodes, // 取得したノード一覧 (ref)
  pending, // 読み込み中フラグ (ref)
  error, // エラーオブジェクト (ref)
} = useResourceList<PhysicalNodeDTO>("physical-nodes");

// ==============================================================================
// Validation Schema (バリデーション定義)
// ==============================================================================
const validationSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, "仮想マシン名は必須です。"),
    nodeId: z.string({ required_error: "ノードを選択してください。" }),
  })
);

// ==============================================================================
// Form Setup (VeeValidate)
// ==============================================================================
// このタブ専用のフォームをセットアップ
// initialValues は親の useVirtualMachineEdit が resetForm を呼んで設定する
const { errors, defineField, values, meta, resetForm, validate } = useForm({
  validationSchema,
  initialValues: {
    name: "",
    nodeId: undefined, // FormSelect の placeholderValue と合わせる
  },
});

// v-model と v-bind 用のヘルパー
const [name, nameAttrs] = defineField("name");
const [nodeId] = defineField("nodeId"); // FormSelect は v-model のみでOK

// ==============================================================================
// Expose (親へのインターフェース公開)
// ==============================================================================
// 親コンポーネント (MoVirtualMachineEdit / useVirtualMachineEdit) が
// このタブフォームを制御するために必要なものを公開します。
defineExpose({
  validate, // 親が "次へ" / "更新" 時に呼び出すバリデーション関数
  resetForm, // 親がデータ取得後に初期値をセットするために呼び出す関数
  values, // 親が "更新" 時にフォームの値を取得するために参照
  meta, // 親がタブのエラー状態(isValid)をチェックするために参照
});
</script>
