<template>
  <div class="bg-white p-4 rounded-lg shadow" style="height: 300px">
    <h3 class="font-semibold text-gray-700 mb-2">{{ title }}</h3>
    <client-only>
      <apexchart
        v-if="series && options"
        width="100%"
        height="250px"
        type="area"
        :options="options"
        :series="series"
      />
      <div
        v-else
        class="flex items-center justify-center h-[250px] text-gray-400"
      >
        データを読み込み中...
      </div>
    </client-only>
  </div>
</template>

<script setup lang="ts">
import type { ApexOptions } from "apexcharts";
defineProps<{
  /** グラフの左上に表示されるタイトル */
  title: string;
  /** ApexChartsに渡すオプション */
  options?: ApexOptions;
  /** ApexChartsに渡すデータ系列 */
  series?: ApexOptions["series"];
}>();
</script>
