<template>
  <div>
    <label v-if="label" :for="name" class="form-label">
      {{ label }}
      <span v-if="required" class="required-asterisk">*</span>
    </label>
    <textarea
      :id="name"
      v-model="model"
      v-bind="allAttrs"
      class="form-input"
      :class="[$attrs.class, { 'form-border-error': error }]"
      :rows="rows"
    ></textarea>
    <p v-if="error" class="text-error">
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * 汎用テキストエリアコンポーネント (FormTextarea.vue)
 * ---------------------------------------------------------------------------------
 * アプリケーション全体で使われる標準的な<textarea>要素をカプセル化したコンポーネント。
 * vee-validateとの連携、エラー表示、ラベルなどの機能を持つ。
 * =================================================================================
 */
import { computed, useAttrs } from "vue";

/**
 * defineOptionsを使用して、親から渡された属性のデフォルトの挙動を制御します。
 * inheritAttrs: false は、propsとして定義されていない属性（例: placeholder）が
 * ルート要素(<div>)に自動で適用されるのを防ぎます。
 */
defineOptions({
  inheritAttrs: false,
});

/**
 * definePropsで、このコンポーネントが親から受け取るプロパティを定義します。
 */
defineProps<{
  /**
   * フォームフィールドの上に表示されるラベルテキスト。
   */
  label?: string;
  /**
   * textareaのid属性とlabelのfor属性を結びつけるための名前。
   */
  name: string;
  /**
   * vee-validateから渡されるバリデーションエラーメッセージ。
   */
  error?: string;
  /**
   * textareaの表示行数。
   */
  rows?: number;
  /**
   * 必須項目を示すアスタリスク(*)をラベルの横に表示するかどうか。
   */
  required?: boolean;
}>();

/**
 * 親コンポーネントとのv-modelによる双方向バインディングを実現します。
 */
const model = defineModel<string | null | undefined>();

/**
 * v-model:attrs を受け取るための定義です。
 * vee-validateの属性（onBlur, onInputイベントなど）がここに入ります。
 */
const validationAttrs = defineModel("attrs");

/**
 * VeeValidate用の属性と、親から渡されたその他の汎用属性（placeholderなど）を
 * 1つのオブジェクトにマージ（合成）します。
 */
const allAttrs = computed(() => {
  const fallthroughAttrs = useAttrs();
  return {
    ...(validationAttrs.value || {}), // vee-validateの属性
    ...fallthroughAttrs, // その他の汎用属性
  };
});
</script>
