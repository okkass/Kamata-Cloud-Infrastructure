<template>
  <div>
    <label v-if="label" :for="name" class="form-label-sm">
      {{ label }}
      <span v-if="required" class="required-asterisk">*</span>
    </label>

    <div v-if="pending" class="text-loading">...</div>
    <div v-else-if="error" class="text-error">...</div>

    <div v-else>
      <select
        :id="name"
        v-model="model"
        v-bind="allAttrs"
        class="form-input"
        :class="{ 'form-border-error': errorMessage }"
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
interface Option {
  id: string;
  name: string;
  [key: string]: any; // その他の任意のプロパティ
}

// 親コンポーネントから受け取る値を定義
defineProps<{
  label: string; // ラベル
  name: string; // id, for属性用
  pending: boolean; // ローディング状態
  error: any; // エラー状態
  options: Option[]; // selectの選択肢
  placeholder: string; // プレースホルダーのテキスト
  errorMessage?: string; // バリデーションエラーメッセージ
  required?: boolean; // 必須項目かどうか
  placeholderValue: string | null | undefined; // プレースホルダーに対応する値
}>();

const model = defineModel();
const validationAttrs = defineModel("attrs");

const allAttrs = computed(() => ({
  ...(validationAttrs.value || {}), // vee-validateの属性
  ...useAttrs(), // step, placeholderなどの汎用属性
}));
</script>
