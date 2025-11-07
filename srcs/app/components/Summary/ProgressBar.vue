<template>
  <div class="bg-white p-4 rounded-lg shadow">
    <h3 class="font-semibold text-gray-700 mb-2">{{ title }}</h3>
    <div class="flex justify-between text-sm font-medium text-gray-600 mb-1">
      <span>{{ usageText }} / {{ totalText }}</span>
      <span>{{ percentageText }}</span>
    </div>
    <div class="w-full bg-gray-200 rounded-full h-2.5">
      <div
        class="h-2.5 rounded-full transition-all duration-300"
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
  usage: number | string; // 単位変換で文字列が来る可能性も考慮
  total: number | string;
  unit: string; // "GB", "MB", "Cores"
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
const barColorClass = computed(() => {
  if (percentage.value > alertThreshold) return "bg-red-500";
  if (percentage.value > warningThreshold) return "bg-yellow-500";
  return "bg-blue-500";
});
</script>
