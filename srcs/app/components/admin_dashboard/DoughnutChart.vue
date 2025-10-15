<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";
import Chart from "chart.js/auto";

const props = defineProps({
  used: { type: Number, required: true },  // 0-100
  label: { type: String, required: true },
  size: { type: Number, default: 120 },
});

const canvasRef = ref(null);
let chart;

const centerTextPlugin = {
  id: "centerText",
  beforeDraw(chart) {
    const { width, height, ctx } = chart;
    const text = chart?.config?.options?.plugins?.centerText?.text;
    if (!text) return;
    ctx.save();
    ctx.font = "bold 14px sans-serif";
    ctx.fillStyle = "#334155";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, width / 2, height / 2);
    ctx.restore();
  },
};

onMounted(() => {
  Chart.register(centerTextPlugin);
  const used = Math.max(0, Math.min(100, props.used));
  chart = new Chart(canvasRef.value.getContext("2d"), {
    type: "doughnut",
    data: {
      labels: ["使用中", "空き"],
      datasets: [
        {
          data: [used, 100 - used],
          backgroundColor: ["#22c55e", "#e5e7eb"],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: false,
      cutout: "70%",
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (c) => `${c.label}: ${c.parsed}%`,
          },
        },
        centerText: { text: used + "%" },
      },
    },
  });
});

onBeforeUnmount(() => {
  chart?.destroy();
});
</script>

<template>
  <div class="text-center">
    <canvas :width="size" :height="size" ref="canvasRef"></canvas>
    <div class="mt-2 text-sm font-semibold">{{ label }}</div>
  </div>
</template>
