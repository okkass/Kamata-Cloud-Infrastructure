<script setup>
import DoughnutChart from "./DoughnutChart.vue";

defineProps({
  title: { type: String, required: true },
  metrics: {
    type: Object,
    required: true, // { cpu, mem, stor }
  },
});
</script>

<template>
  <div class="bg-white rounded-xl shadow p-5">
    <div class="pl-3 border-l-4 border-emerald-500 text-lg font-bold mb-4">
      {{ title }}
    </div>
    <div class="flex flex-wrap gap-6">
      <DoughnutChart :used="metrics.cpu" label="CPU" />
      <DoughnutChart :used="metrics.mem" label="メモリ" />
      <DoughnutChart :used="metrics.stor" label="ストレージ" />
    </div>
  </div>
</template>
