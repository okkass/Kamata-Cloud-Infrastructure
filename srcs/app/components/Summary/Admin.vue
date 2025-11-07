<template>
  <div v-if="pending && !data" class="text-center py-10 text-gray-500">
    管理者データを読み込み中...
  </div>
  <div v-else-if="error" class="text-red-500">
    履歴の読み込みに失敗しました: {{ error.message }}
  </div>
  <div v-else-if="data" class="space-y-8">
    <section v-if="data.clusterSummary">
      <h2 class="text-xl font-semibold mb-4">現在のリソース状況</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryProgressBar
          title="CPU 使用率"
          :usage="data.clusterSummary.usedCpu.toFixed(1)"
          :total="data.clusterSummary.totalCpu"
          unit="Cores"
        />
        <SummaryProgressBar
          title="メモリ使用率"
          :usage="(data.clusterSummary.usedMemory / 1024).toFixed(1)"
          :total="(data.clusterSummary.totalMemory / 1024).toFixed(0)"
          unit="GB"
        />
        <SummaryProgressBar
          title="ストレージ使用率"
          :usage="data.clusterSummary.usedStorage"
          :total="data.clusterSummary.totalStorage"
          unit="GB"
        />
      </div>
    </section>

    <section
      v-if="chartConfigData?.nodes"
      v-for="node in chartConfigData.nodes"
      :key="node.id"
    >
      <h2 class="text-xl font-semibold mb-4">{{ node.name }}</h2>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SummaryTimeSeries
          title="CPU使用率 (過去24時間)"
          :options="node.cpuChart.options"
          :series="node.cpuChart.series"
        />
        <SummaryTimeSeries
          title="メモリ使用率 (過去24時間)"
          :options="node.memChart.options"
          :series="node.memChart.series"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from "vue";
import type { ApexOptions } from "apexcharts";
import SummaryProgressBar from "~/components/Summary/ProgressBar.vue";
import SummaryTimeSeries from "~/components/Summary/TimeSeries.vue";

const { data, pending, error, refresh } = await useFetch<SummaryResponse>(
  "/api/summary",
  {
    params: { admin: "1" }, // 管理者フラグを立てて取得
  }
);

const createChartOptions = (title: string): ApexOptions => {
  return {
    chart: {
      type: "area",
      zoom: { enabled: false },
      toolbar: { show: false },
    },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: { opacityFrom: 0.7, opacityTo: 0.1 },
    },
    xaxis: {
      type: "datetime",
      labels: { format: "HH:mm" },
    },
    yaxis: {
      min: 0,
      max: 100,
      labels: {
        formatter: (value: number) => `${value.toFixed(1)}%`,
      },
    },
    tooltip: {
      x: { format: "MM:dd:HH:mm" },
      y: {
        formatter: (value: number) => `${value.toFixed(1)}%`,
        title: {
          formatter: () => title,
        },
      },
    },
  };
};
// --- 管理者データ用のComputed ---
const chartConfigData = computed(() => {
  if (!data.value || !data.value.data) return null;

  const formatForApex = (history: HistoryItem[], label: string) => {
    return {
      options: createChartOptions(label),
      series: [
        {
          name: label,
          data: history.map((item) => [item.timestamp, item.value * 100]),
        },
      ],
    };
  };

  return {
    nodes: data.value.data.map((node) => ({
      ...node,
      cpuChart: formatForApex(node.cpuHistory, "CPU"),
      memChart: formatForApex(node.memHistory, "メモリ"),
    })),
  };
});

// --- ポーリングロジック ---
let intervalId: ReturnType<typeof setInterval> | null = null;
onMounted(() => {
  intervalId = setInterval(() => refresh(), 5000);
});
onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});
</script>
