<template>
  <div>
    <label v-if="label" :for="name" class="form-label-sm">
      {{ label }}
      <span v-if="required" class="required-asterisk">*</span>
    </label>

    <div v-if="pending" class="text-loading">
      {{ label }}一覧を読み込み中...
    </div>

    <div v-else-if="error" class="text-error">
      {{ label }}一覧の取得に失敗しました。
    </div>

    <div v-else>
      <select
        :id="name"
        v-model="model"
        v-bind="allAttrs"
        class="form-input"
        :class="[$attrs.class, { 'form-border-error': errorMessage }]"
        :disabled="disabled"
      >
        <option :value="placeholderValue" :disabled="required">
          {{ placeholder }}
        </option>

        <option v-for="option in options" :key="option.id" :value="option.id">
          <slot name="option" :option="option">
            {{ option.name }}
          </slot>
        </option>
      </select>

      <p v-if="errorMessage" class="text-error">
        {{ errorMessage }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * 汎用Selectフォームコンポーネント (FormSelect.vue)
 * ---------------------------------------------------------------------------------
 * アプリケーション全体で使われる標準的な<select>要素をカプセル化したコンポーネント。
 * APIからの非同期データ取得（ローディング・エラー状態）や、vee-validateとの連携、
 * 選択肢表示のカスタマイズ（スロット）などの機能を持つ。
 * =================================================================================
 */
import { computed, useAttrs } from "vue";

// defineOptionsを使用して、親から渡された属性のデフォルトの挙動を制御します。
defineOptions({
  inheritAttrs: false,
});

/**
 * ==============================================================================
 * Type Definitions (型定義)
 * ==============================================================================
 */
interface Option {
  id: string;
  name: string;
  [key: string]: any; // その他の任意のプロパティを許容
}

/**
 * ==============================================================================
 * Props (親からの受け取りデータ)
 * ==============================================================================
 */
defineProps<{
  /** ラベルとして表示するテキスト。指定されなければラベルは表示されない。 */
  label?: string;
  /** select要素のid属性とlabel要素のfor属性を結びつけるための名前。 */
  name: string;
  /** データをローディング中かどうか。trueの場合、ローディング表示になる。 */
  pending?: boolean;
  /** データの取得に失敗したかどうか。trueの場合、エラー表示になる。 */
  error?: any;
  /** selectの選択肢となるオブジェクトの配列。 */
  options?: Option[];
  /** プレースホルダー（未選択時の項目）のテキスト。 */
  placeholder?: string;
  /** バリデーションエラーメッセージ。存在する場合にエラー表示を行う。 */
  errorMessage?: string;
  /** 必須項目かどうか。アスタリスク表示やプレースホルダーの無効化に使用。 */
  required?: boolean;
  /** プレースホルダーに対応する値。v-modelの初期値と一致させる必要がある。 */
  placeholderValue?: string | null | undefined;
  /** select要素を無効化するかどうか。 */
  disabled?: boolean;
}>();

/**
 * ==============================================================================
 * v-model & Attributes (双方向バインディングと属性)
 * ==============================================================================
 */
// v-model（選択された値）の双方向バインディング
const model = defineModel<string | number | null | undefined | unknown>();

// v-model:attrs（vee-validateからの属性）の双方向バインディング
const validationAttrs = defineModel("attrs");

// VeeValidate用の属性と、親から渡されたその他の汎用属性をマージする
const allAttrs = computed(() => {
  const fallthroughAttrs = useAttrs();
  return {
    ...(validationAttrs.value || {}),
    ...fallthroughAttrs,
  };
});
</script>
