<template>
  <div class="summary-progress-card">
    <h3 class="summary-progress-title">{{ title }}</h3>

    <ClientOnly>
      <apexchart
        v-if="series && options"
        width="100%"
        height="250px"
        type="area"
        :options="options"
        :series="series"
      />
      <div v-else class="chart-loading-state">データを読み込み中...</div>

      <template #fallback>
        <div class="chart-loading-state">グラフを読み込み中...</div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * 時系列グラフコンポーネント (SummaryTimeSeries.vue)
 * ---------------------------------------------------------------------------------
 * ApexChartsを使用して、時系列データを表示する汎用コンポーネント。
 * SSR時の警告を避けるため、<ClientOnly>でラップして使用する。
 * =================================================================================
 */
import type { ApexOptions } from "apexcharts";

/**
 * ==============================================================================
 * Props (親からの受け取りデータ)
 * ==============================================================================
 */
defineProps<{
  /** グラフの左上に表示されるタイトル */
  title: string;
  /** ApexChartsに渡すオプション */
  options?: ApexOptions;
  /** ApexChartsに渡すデータ系列 */
  series?: ApexOptions["series"];
}>();
</script>
