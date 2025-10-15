<script setup lang="ts">
import DoughnutChart from "~/components/user-dashboard/DoughnutChart.vue";
import StatsCard from "~/components/user-dashboard/StatsCard.vue";

// ダミーデータ（実装時にAPIへ差し替え）
const vmMetrics = { cpu: 45, mem: 60, stor: 50 };
const netMetrics = { in: 70, out: 40 };
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

    <!-- サマリー：上2つ＝円グラフ、下1つ＝数値カード -->
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

        <!-- ネットワークの状態（円グラフ2枚） -->
        <div class="bg-white rounded-xl shadow p-5">
          <h3 class="pl-3 border-l-4 border-sky-500 text-lg font-bold mb-4">
            ネットワークの状態
          </h3>
          <div class="flex justify-center gap-6 flex-wrap">
            <DoughnutChart :used="netMetrics.in" label="受信トラフィック" />
            <DoughnutChart :used="netMetrics.out" label="送信トラフィック" />
          </div>
        </div>

        <!-- ポートフォリオページのビュー数（数値カード） -->
        <StatsCard title="ポートフォリオページのビュー数" :items="pvSummary" />
      </div>
    </section>
  </main>
</template>
