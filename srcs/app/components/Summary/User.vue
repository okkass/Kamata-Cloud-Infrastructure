<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <section class="summary-section lg:col-span-1">
      <SummaryQuickLink :isAdmin="isAdmin" />
    </section>
    <section v-if="summaryData" class="summary-section lg:col-span-1">
      <h2 class="summary-section-title">あなたのリソース割り当て</h2>
      <div class="summary-grid">
        <SummaryProgressBar
          title="CPU 割り当て"
          :usage="summaryData.clusterSummary.usedCpu.toFixed(1)"
          :total="summaryData.clusterSummary.totalCpu"
          unit="Cores"
        />
        <SummaryProgressBar
          title="メモリ割り当て"
          :usage="
            convertByteToUnit(
              summaryData.clusterSummary.usedMemory,
              'GB',
              DISABLE_ROUNDING
            ).toFixed(1)
          "
          :total="
            convertByteToUnit(
              summaryData.clusterSummary.totalMemory,
              'GB',
              DISABLE_ROUNDING
            ).toFixed(0)
          "
          unit="GB"
        />
        <SummaryProgressBar
          title="ストレージ割り当て"
          :usage="
            convertByteToUnit(
              summaryData.clusterSummary.usedStorage,
              'GB',
              DISABLE_ROUNDING
            ).toFixed(1)
          "
          :total="
            convertByteToUnit(
              summaryData.clusterSummary.totalStorage,
              'GB',
              DISABLE_ROUNDING
            ).toFixed(0)
          "
          unit="GB"
        />
      </div>
    </section>
    <div v-else-if="summaryPending" class="loading-text">
      リソース状況を読み込み中...
    </div>
    <div v-else-if="summaryError" class="error-text">
      リソース状況の読み込みに失敗しました。
    </div>
  </div>

  <section
    v-if="chartConfigData?.vms"
    v-for="vm in chartConfigData.vms"
    :key="vm.id"
    class="summary-timeseries-section"
  >
    <h2 class="summary-section-title">{{ vm.name }}</h2>
    <div class="summary-timeseries-grid">
      <SummaryTimeSeries
        title="CPU使用率 (過去24時間)"
        :options="vm.cpuChart.options"
        :series="vm.cpuChart.series"
      />
      <SummaryTimeSeries
        title="メモリ使用率 (過去24時間)"
        :options="vm.memChart.options"
        :series="vm.memChart.series"
      />
    </div>
  </section>
  <div v-else-if="historyPending" class="loading-text">
    グラフ履歴を読み込み中...
  </div>
  <div v-else-if="historyError" class="error-text">
    グラフ履歴の読み込みに失敗しました。
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import SummaryProgressBar from "~/components/Summary/ProgressBar.vue";
import SummaryTimeSeries from "~/components/Summary/TimeSeries.vue";

const isAdmin = ref(false); // ここ変えてください。
const {
  summaryData,
  summaryPending,
  summaryError,
  historyPending,
  historyError,
  chartConfigData,
} = useSummary(isAdmin);
</script>
