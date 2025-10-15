<script setup lang="ts">
import DoughnutChart from "~/components/user-dashboard/DoughnutChart.vue";
import StatsCard from "~/components/user-dashboard/StatsCard.vue";

// ダミーデータ（実装時にAPIへ置き換え）
const vmMetrics = { cpu: 45, mem: 60, stor: 50 };

// ネットワーク（Mbps単位）
const netSummary = [
  { label: "受信トラフィック", value: "150 Mbps" },
  { label: "送信トラフィック", value: "90 Mbps" },
];

const pvSummary = [
  { label: "過去24時間", value: "150回" },
  { label: "過去7日間", value: "1,200回" },
];

// クイックリンク（必要に応じてNuxtLink化）
const quickLinks = [
  { label: "仮想マシンメニューへ", href: "#" },
  { label: "ネットワークメニューへ", href: "#" },
  { label: "セキュリティグループへ", href: "#" },
];
</script>

<template>
  <main class="p-6 md:p-8 bg-slate-50 text-slate-800">
    <h1 class="text-2xl font-bold mb-6">利用者ダッシュボード</h1>

    <!-- クイックリンク -->
    <section class="mb-8">
      <div class="flex flex-wrap gap-2">
        <a
          v-for="(l, i) in quickLinks"
          :key="i"
          :href="l.href"
          class="px-4 py-2 rounded bg-slate-200 hover:bg-slate-300 text-sm"
        >
          {{ l.label }}
        </a>
      </div>
    </section>

    <!-- サマリー -->
    <section>
      <h2 class="text-xl font-bold mb-3">サマリー</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- 仮想マシン利用状況（円グラフ3枚） -->
        <div class="bg-white rounded-xl shadow p-5">
          <h3 class="pl-3 border-l-4 border-emerald-500 text-lg font-bold mb-4">
            仮想マシン利用状況
          </h3>
          <div class="flex justify-center gap-6 flex-wrap">
            <DoughnutChart :used="vmMetrics.cpu" label="CPU" />
            <DoughnutChart :used="vmMetrics.mem" label="メモリ" />
            <DoughnutChart :used="vmMetrics.stor" label="ストレージ" />
          </div>
        </div>

        <!-- ネットワークの状態（数値カード） -->
        <StatsCard title="ネットワークの状態" :items="netSummary" />

        <!-- ポートフォリオページのビュー数（数値カード） -->
        <StatsCard title="ポートフォリオページのビュー数" :items="pvSummary" />
      </div>
    </section>
  </main>
</template>
