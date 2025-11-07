import { computed, onMounted, onUnmounted } from "vue";
import type { Ref } from "vue";
import type { ApexOptions } from "apexcharts";

/**
 * ==================================================================
 * ApexCharts用の共通オプションを生成する「関数」
 * ==================================================================
 */
const createChartOptions = (
  title: string,
  totalValue: number,
  unit: string
): ApexOptions => {
  return {
    chart: { type: "area", zoom: { enabled: false }, toolbar: { show: false } },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    fill: { type: "gradient", gradient: { opacityFrom: 0.7, opacityTo: 0.1 } },
    xaxis: { type: "datetime", labels: { format: "HH:mm" } },
    yaxis: {
      min: 0,
      max: 100,
      labels: { formatter: (value: number) => `${value.toFixed(1)}%` },
    },
    tooltip: {
      x: { format: "MM/dd HH:mm" },
      y: {
        formatter: (value: number) => {
          const actualValue = (value / 100) * totalValue;
          const actualValueFormatted =
            unit === "Cores" ? actualValue.toFixed(1) : actualValue.toFixed(2);
          return `${actualValueFormatted} ${unit} (${value.toFixed(1)}%)`;
        },
        title: { formatter: () => title },
      },
    },
  };
};
// ★ 2. ネットワークI/O (KB/sなど) 用のオプション
const createNetworkChartOptions = (title: string): ApexOptions => {
  return {
    chart: { type: "area", zoom: { enabled: false }, toolbar: { show: false } },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    // グラフの色を緑系に変更して区別
    fill: {
      type: "gradient",
      gradient: { opacityFrom: 0.7, opacityTo: 0.1 },
      colors: ["#00E396"],
    },
    colors: ["#00E396"],
    xaxis: { type: "datetime", labels: { format: "HH:mm" } },
    yaxis: {
      // min/maxを削除し、自動スケールにする
      labels: { formatter: (value: number) => `${value.toFixed(0)} KB` }, // 単位をKBと仮定
    },
    tooltip: {
      x: { format: "MM/dd HH:mm" },
      y: {
        formatter: (value: number) => `${value.toFixed(2)} KB`, // 単位をKBと仮定
        title: { formatter: () => title },
      },
    },
  };
};

/**
 * ==================================================================
 * サマリーデータ取得・整形ロジックのComposable
 * @param isAdmin - 管理者モードかどうかを示すRef
 * ==================================================================
 */
export function useSummary(isAdmin: Ref<boolean>) {
  // 1. APIを叩く際の共通パラメータ
  const apiParams = computed(() => ({
    admin: isAdmin.value ? "1" : "0",
  }));

  // 2. リアルタイムAPIの呼び出し
  const {
    data: summaryData,
    pending: summaryPending,
    error: summaryError,
    refresh: summaryRefresh,
  } = useFetch<SummaryResponse>("/api/summary/realtime", {
    params: apiParams,
    lazy: true,
    server: false,
  });

  // 3. 履歴APIの呼び出し
  const {
    data: historyData,
    pending: historyPending,
    error: historyError,
    refresh: historyRefresh,
  } = useFetch<SummaryHistoryResponse>("/api/summary/history", {
    params: apiParams,
    lazy: true,
    server: false,
  });

  // 4. グラフデータ整形ロジック
  const chartConfigData = computed(() => {
    if (!historyData.value || !historyData.value.data) return null;

    const formatForApex = (
      history: HistoryItem[],
      label: string,
      totalValue: number,
      unit: string
    ) => {
      const series = [
        {
          name: label,
          data: history.map((item) => [item.timestamp, item.value * 100]),
        },
      ];
      const options = createChartOptions(label, totalValue, unit);
      return { series, options };
    };
    const formatForNetwork = (history: HistoryItem[], label: string) => {
      const series = [
        {
          name: label,
          data: history.map((item) => [item.timestamp, item.value]),
        },
      ]; // *100 しない
      const options = createNetworkChartOptions(label);
      return { series, options };
    };

    if (isAdmin.value) {
      return {
        nodes: (historyData.value.data as NodeData[]).map((node) => ({
          ...node,
          cpuChart: formatForApex(
            node.cpuHistory,
            "CPU",
            node.totalCpu,
            "Cores"
          ),
          memChart: formatForApex(
            node.memHistory,
            "メモリ",
            convertByteToUnit(node.totalMemory, "GB", false),
            "GB"
          ),
          networkChart: formatForNetwork(
            node.networkHistory,
            "ネットワーク I/O"
          ),
        })),
        vms: null,
      };
    } else {
      return {
        nodes: null,
        vms: (historyData.value.data as VmData[]).map((vm) => ({
          ...vm,
          cpuChart: formatForApex(vm.cpuHistory, "CPU", vm.totalCpu, "Cores"),
          memChart: formatForApex(
            vm.memHistory,
            "メモリ",
            convertByteToUnit(vm.totalMemory, "GB", false),
            "GB"
          ),
        })),
      };
    }
  });

  // 5. ポーリングロジック
  const intervals: ReturnType<typeof setInterval>[] = [];
  onMounted(() => {
    summaryRefresh();
    historyRefresh();
    intervals.push(setInterval(() => summaryRefresh(), 5000));
    intervals.push(setInterval(() => historyRefresh(), 900000));
  });
  onUnmounted(() => {
    intervals.forEach(clearInterval);
  });

  // 6. 必要なデータをすべて返す
  return {
    summaryData,
    summaryPending,
    summaryError,
    historyData,
    historyPending,
    historyError,
    chartConfigData,
  };
}
