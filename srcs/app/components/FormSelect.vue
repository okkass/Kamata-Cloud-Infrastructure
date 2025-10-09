<template>
  <div>
    <label :for="name" class="form-label-sm">{{ label }}</label>

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
        v-bind="attrs || {}"
        class="form-input"
        :class="{ 'form-border-error': errorMessage }"
      >
        <option :value="placeholderValue" :disabled="required">
          {{ placeholder }}
        </option>
        <option v-for="option in options" :key="option.id" :value="option.id">
          {{ option.name }}
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

// v-model と v-bind を親コンポーネントと双方向バインディング
const model = defineModel();
const attrs = defineModel("attrs");
</script>
