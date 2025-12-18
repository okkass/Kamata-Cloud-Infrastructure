<template>
  <div>
    <label v-if="label" :for="name" class="form-label-sm">
      {{ label }}
      <span v-if="required" class="required-asterisk">*</span>
    </label>
    <div class="flex items-center">
      <input
        :id="name"
        :type="type"
        v-model="model"
        v-bind="allAttrs"
        class="form-input"
        :class="[$attrs.class, { 'form-border-error': error }]"
        :disabled="disabled"
      />
      <slot name="suffix" />
    </div>
    <p v-if="error" class="text-error">
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * 汎用入力フォームコンポーネント (FormInput.vue)
 * ---------------------------------------------------------------------------------
 * アプリケーション全体で使われる標準的な<input>要素をカプセル化したコンポーネント。
 * vee-validateとの連携、エラー表示、ラベル、単位表示(suffix)などの機能を持ちます。
 * =================================================================================
 */
import { computed, useAttrs } from "vue";

/**
 * defineOptionsを使用して、親から渡された属性のデフォルトの挙動を制御します。
 * inheritAttrs: false は、propsとして定義されていない属性（例: placeholder, step）が
 * ルート要素(<div>)に自動で適用されるのを防ぎます。
 */
defineOptions({
  inheritAttrs: false,
});

/**
 * definePropsで、このコンポーネントが親から受け取るプロパティ（props）を型定義と共に宣言します。
 */
defineProps<{
  /**
   * フォームフィールドの上に表示されるラベルテキスト。
   * v-ifで制御されており、渡されない場合は描画されません。
   */
  label?: string;
  /**
   * inputのid属性とlabelのfor属性を結びつけるためのユニークな名前。
   * アクセシビリティのために必須です。
   */
  name: string;
  /**
   * input要素のtype属性（例: "text", "number", "password"）。
   */
  type?: string;
  /**
   * vee-validateから渡されるバリデーションエラーメッセージ。
   * この値が存在する場合、エラー表示が行われます。
   */
  error?: string;
  /**
   * input要素を無効化するかどうか。
   */
  disabled?: boolean;
  /**
   * 必須項目を示すアスタリスク(*)をラベルの横に表示するかどうか。
   */
  required?: boolean;
}>();

/**
 * 親コンポーネントとのv-modelによる双方向バインディングを実現します。
 * フォームの入力値がこの変数に格納されます。
 */
const model = defineModel<string | number | null | undefined | unknown>();

/**
 * v-model:attrs を受け取るための定義です。
 * vee-validateのdefineFieldが返す属性（onBlur, onInputイベントなど）がここに入ります。
 */
const validationAttrs = defineModel("attrs");

/**
 * VeeValidate用の属性と、親から渡されたその他の汎用属性（placeholder, stepなど）を
 * 1つのオブジェクトにマージ（合成）します。
 * これにより、<input>要素にv-bindで一度に全ての属性を渡すことができます。
 */
const allAttrs = computed(() => {
  // useAttrs()で、propsとして定義されていない全ての属性(placeholder, stepなど)を取得
  const fallthroughAttrs = useAttrs();

  return {
    ...(validationAttrs.value || {}), // vee-validateの属性
    ...fallthroughAttrs, // その他の汎用属性
  };
});
</script>
