<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";

const props = defineProps({
  used: { type: Number, required: true }, // 0–100
  label: { type: String, required: true },
  size: { type: Number, default: 120 },
});

const canvasRef = ref(null);
let chart;
let ChartLib;

// 中央テキストを各チャートの options から読むプラグイン（インスタンスごとに異なる値OK）
const centerTextPlugin = {
  id: "centerText",
  beforeDraw(c) {
    const text = c?.config?.options?.plugins?.centerText?.text;
    if (!text) return;
    const { width, height, ctx } = c;
    ctx.save();
    ctx.font = "bold 14px sans-serif";
    ctx.fillStyle = "#334155"; // slate-700
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, width / 2, height / 2);
    ctx.restore();
  },
};

function clampUsed(val) {
  return Math.max(0, Math.min(100, Number(val) || 0));
}

async function createChart() {
  if (!ChartLib) {
    const { default: _Chart } = await import("chart.js/auto");
    ChartLib = _Chart;
    ChartLib.register(centerTextPlugin);
  }

  const ctx = canvasRef.value.getContext("2d");
  const used = clampUsed(props.used);

  chart?.destroy();
  chart = new ChartLib(ctx, {
    type: "doughnut",
    data: {
      labels: ["使用中", "空き"],
      datasets: [
        {
          data: [used, 100 - used],
          backgroundColor: ["#22c55e", "#e5e7eb"], // green-500 / gray-200
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: false,
      cutout: "70%",
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (c) => `${c.label}: ${c.parsed}%` } },
        // ★ 各インスタンス固有のテキスト
        centerText: { text: `${used}%` },
      },
    },
  });
}

function updateChart(val) {
  if (!chart) return;
  const used = clampUsed(val);
  chart.data.datasets[0].data = [used, 100 - used];
  chart.options.plugins.centerText.text = `${used}%`;
  chart.update();
}

onMounted(createChart);
watch(
  () => props.used,
  (v) => updateChart(v)
);
onBeforeUnmount(() => chart?.destroy?.());
</script>

<template>
  <div class="text-center">
    <canvas :width="size" :height="size" ref="canvasRef"></canvas>
    <div class="mt-2 text-sm font-semibold">{{ label }}</div>
  </div>
</template>
