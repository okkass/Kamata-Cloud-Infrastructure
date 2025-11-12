<template>
  <div class="summary-progress-card" style="height: 330px">
    <h3 class="summary-progress-title">ノード情報</h3>

    <div class="space-y-3 pt-4 text-sm">
      <div class="flex justify-between">
        <span class="text-gray-500">ノード名:</span>
        <span class="font-semibold">{{ node.name }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-500">ID:</span>
        <span class="font-mono text-xs">{{ node.id }}</span>
      </div>

      <hr class="my-2 pt-2" />

      <div class="flex justify-between">
        <span class="text-gray-500">合計 CPU:</span>
        <span class="font-semibold">{{ node.totalCpu }} Cores</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-500">合計 メモリ:</span>
        <span class="font-semibold">
          {{ (node.totalMemory / 1024 ** 3).toFixed(0) }} GB
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// (グローバルな型定義ファイルからインポートするのがベスト)
interface NodeData {
  id: string;
  name: string;
  totalCpu: number;
  totalMemory: number;
  [key: string]: any; // cpuHistoryなど他のプロパティも許容
}

defineProps<{
  node: NodeData;
}>();
</script>
