<template>
  <div class="summary-progress-card">
    <h3 class="summary-progress-title">{{ title }}</h3>
    <div class="summary-progress-text">
      <span>{{ usageText }} / {{ totalText }}</span>
      <span>{{ percentageText }}</span>
    </div>
    <div class="summary-progress-track">
      <div
        class="summary-progress-bar"
        :class="barColorClass"
        :style="{ width: percentage + '%' }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  title: string;
  usage: number | string;
  total: number | string;
  unit: string;
}>();

const alertThreshold = 90;
const warningThreshold = 75;

// 数値に変換
const usageNum = computed(() => Number(props.usage));
const totalNum = computed(() => Number(props.total));

// 使用率 (0-100)
const percentage = computed(() => {
  if (totalNum.value === 0) return 0;
  return (usageNum.value / totalNum.value) * 100;
});

// パーセント表示 (例: "75.0%")
const percentageText = computed(() => `${percentage.value.toFixed(1)}%`);
// 使用量テキスト (例: "10 GB")
const usageText = computed(() => `${props.usage} ${props.unit}`);
// 全体量テキスト (例: "20 GB")
const totalText = computed(() => `${props.total} ${props.unit}`);

// 使用率に応じてプログレスバーの色を変更
// ★ CSSクラス名を返すように変更
const barColorClass = computed(() => {
  if (percentage.value > alertThreshold) return "progress-bar-danger";
  if (percentage.value > warningThreshold) return "progress-bar-warning";
  return "progress-bar-normal";
});
</script>
