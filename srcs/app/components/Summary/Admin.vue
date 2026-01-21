<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <section class="summary-section lg:col-span-1">
      <SummaryQuickLink />
    </section>
    <section
      v-if="summaryData && summaryData.clusterSummary"
      class="summary-section lg:col-span-1"
    >
      <h2 class="summary-section-title">現在のリソース状況</h2>
      <div class="summary-grid">
        <SummaryProgressBar
          title="CPU 使用率"
          :usage="summaryData.clusterSummary.usedCpu.toFixed(1)"
          :total="summaryData.clusterSummary.totalCpu"
          unit="Cores"
        />
        <SummaryProgressBar
          title="メモリ使用率"
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
          title="ストレージ使用率"
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

  <template v-if="chartConfigData?.nodes">
    <section
      v-for="node in chartConfigData.nodes"
      :key="node.id"
      class="summary-timeseries-section"
    >
      <h2 class="summary-section-title">{{ node.name }}</h2>
      <div class="summary-timeseries-grid">
        <SummaryNodeInfoCard :node="node" />
        <SummaryTimeSeries
          title="ネットワーク使用率 (過去24時間)"
          :options="node.networkChart.options"
          :series="node.networkChart.series"
        />
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
  </template>
  <div v-else-if="historyPending" class="loading-text">
    グラフ履歴を読み込み中...
  </div>
  <div v-else-if="historyError" class="error-text">
    グラフ履歴の読み込みに失敗しました。
  </div>
</template>

<script setup lang="ts">
import SummaryProgressBar from "~/components/Summary/ProgressBar.vue";
import SummaryTimeSeries from "~/components/Summary/TimeSeries.vue";

const { isAdmin } = useUserPermission();

const {
  summaryData,
  summaryPending,
  summaryError,
  historyPending,
  historyError,
  chartConfigData,
} = useSummary(isAdmin);
</script>
