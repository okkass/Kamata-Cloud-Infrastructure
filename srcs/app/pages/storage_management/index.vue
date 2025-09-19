<script>
import DashboardLayout from "./../../components/DashboardLayout.vue";

export default {
  name: "StorageIndex",
  components: { DashboardLayout },
  data() {
    return {
      columns: [
        { key: "poolName", label: "ストレージプール名" },
        { key: "type", label: "タイプ" },
        { key: "node", label: "ノード" },
        { key: "size", label: "サイズ" },
        { key: "used", label: "使用済みデータ量" },
        { key: "usage", label: "使用率" },
      ],
      rows: [
        {
          id: 1,
          poolName: "pool01",
          type: "local",
          node: "Node-X",
          sizeGB: 1919,
          usedGB: 810,
        },
        {
          id: 2,
          poolName: "pool02",
          type: "network",
          node: "Node-X",
          sizeGB: 810,
          usedGB: 40,
        },
      ],
      headerButtons: [
        { label: "ローカルストレージ追加", action: "add-local" },
        { label: "ネットワークストレージ追加", action: "add-network" },
      ],
      rowActions: [
        { label: "詳細", action: "detail" },
        { label: "編集", action: "edit" },
        { label: "削除", action: "delete" },
      ],
    };
  },
  methods: {
    onHeader(action) {
      if (action === "add-local") alert("ローカルストレージ追加（仮）");
      if (action === "add-network") alert("ネットワークストレージ追加（仮）");
    },
    onRow({ action, row }) {
      if (action === "detail") alert(`詳細（仮）：${row.poolName}`);
      if (action === "edit") alert(`編集（仮）：${row.poolName}`);
      if (action === "delete") {
        if (confirm(`「${row.poolName}」を削除しますか？`)) {
          alert("削除しました（仮）");
        }
      }
    },
  },
};
</script>

<template>
  <DashboardLayout
    title="ストレージ管理ダッシュボード"
    :columns="columns"
    :rows="rows"
    rowKey="id"
    :headerButtons="headerButtons"
    :rowActions="rowActions"
    @header-action="onHeader"
    @row-action="onRow"
  >
    <!-- タイプ：バッジ表示 -->
    <template #cell-type="{ row }">
      <span
        class="inline-flex items-center rounded-full px-3 py-1 text-[12px] font-bold"
        :class="
          row.type === 'local'
            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
            : 'bg-sky-50 text-sky-700 ring-1 ring-sky-200'
        "
      >
        {{ row.type === "local" ? "ローカル" : "ネットワーク" }}
      </span>
    </template>

    <!-- サイズ / 使用量：桁揃え -->
    <template #cell-size="{ row }">
      <span class="tabular-nums">{{ row.sizeGB }} GB</span>
    </template>
    <template #cell-used="{ row }">
      <span class="tabular-nums">{{ row.usedGB }} GB</span>
    </template>

    <!-- 使用率：プログレスバー＋%表示 -->
    <template #cell-usage="{ row }">
      <div class="min-w-[160px]">
        <div class="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
          <div
            class="h-2.5 rounded-full transition-all"
            :class="[
              Math.round((row.usedGB / row.sizeGB) * 100) <= 70
                ? 'bg-emerald-500'
                : Math.round((row.usedGB / row.sizeGB) * 100) <= 90
                ? 'bg-amber-500'
                : 'bg-red-500',
            ]"
            :style="{
              width:
                Math.min(100, Math.round((row.usedGB / row.sizeGB) * 100)) +
                '%',
            }"
          />
        </div>
        <div class="mt-1 text-right text-[13px] font-semibold tabular-nums">
          {{ Math.min(100, Math.round((row.usedGB / row.sizeGB) * 100)) }}%
        </div>
      </div>
    </template>
  </DashboardLayout>
</template>
