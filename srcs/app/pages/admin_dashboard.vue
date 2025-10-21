<script setup lang="ts">
import NodeCard from "~/components/admin_dashboard/NodeCard.vue";

const nodes = [
  { title: "ノードA", metrics: { cpu: 70, mem: 60, stor: 80 } },
  { title: "ノードB", metrics: { cpu: 40, mem: 55, stor: 30 } },
];
</script>

<template>
  <main class="p-6 md:p-8 bg-slate-50 text-slate-800">
    <!-- タイトル -->
    <h1 class="text-2xl font-bold mb-6">管理者ダッシュボード</h1>

    <!-- 上部の操作ボタン -->
    <div class="flex flex-wrap gap-2 mb-6">
      <button class="px-4 py-2 rounded bg-slate-200 hover:bg-slate-300">
        物理ノード
      </button>
      <button class="px-4 py-2 rounded bg-slate-200 hover:bg-slate-300">
        インスタンスタイプ
      </button>
      <button class="px-4 py-2 rounded bg-slate-200 hover:bg-slate-300">
        利用者管理
      </button>
      <button class="px-4 py-2 rounded bg-slate-200 hover:bg-slate-300">
        イメージ管理
      </button>
    </div>

    <!-- ノード一覧 -->
    <h2 class="text-xl font-bold mb-3">ノード一覧とリソース使用率</h2>

    <section class="space-y-4">
      <NodeCard
        v-for="(n, i) in nodes"
        :key="i"
        :title="n.title"
        :metrics="n.metrics"
      />
    </section>
  </main>
</template>
