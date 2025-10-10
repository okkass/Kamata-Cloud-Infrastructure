<!-- pages/image-management/index.vue -->
<script setup lang="ts">
import { ref } from "vue";
import DashboardLayout from "~/components/DashboardLayout.vue";

type Row = {
  id: string | number;
  name: string;
  size: string;
  createdAt: string;
  status?: "稼働中" | "停止中" | "—";
  protected?: boolean;
};

const columns = [
  { key: "name", label: "イメージ名" },
  { key: "size", label: "サイズ" },
  { key: "createdAt", label: "登録日" },
  { key: "status", label: "状態" },
] as const;

const HEADER_BUTTONS = [{ label: "イメージ追加", action: "add" }] as const;
const ROW_ACTIONS = [
  { label: "詳細", action: "detail" },
  { label: "削除", action: "delete" },
] as const;

const rows = ref<Row[]>([
  {
    id: 1,
    name: "Ubuntu 22.04 LTS",
    size: "1.5GB",
    createdAt: "2025-06-20",
    status: "稼働中",
    protected: true,
  },
  {
    id: 2,
    name: "CentOS 8 Stream",
    size: "2.1GB",
    createdAt: "2025-06-15",
    status: "停止中",
    protected: false,
  },
]);

const statusClass = (s?: Row["status"]) =>
  s === "稼働中" ? "status-active" : s === "停止中" ? "status-inactive" : "";

const onHeader = (action: string) => {
  if (action === "add") alert("イメージ追加（仮処理）");
};
const onRow = ({ action, row }: { action: string; row: Row }) => {
  if (action === "detail") {
    alert(`詳細を表示: ${row.name}`);
  } else if (action === "delete") {
    if (row.protected) return alert("保護されているため削除できません。");
    if (confirm(`${row.name} を削除しますか？`))
      alert("削除しました（仮処理）");
  }
};
</script>

<template>
  <DashboardLayout
    title="イメージ管理ダッシュボード"
    :columns="columns"
    :rows="rows"
    row-key="id"
    :header-buttons="HEADER_BUTTONS"
    :row-actions="ROW_ACTIONS"
    @header-action="onHeader"
    @row-action="onRow"
  >
    <template #cell-status="{ row }">
      <span :class="statusClass(row.status)">{{ row.status ?? "—" }}</span>
    </template>

    <template #row-actions="{ row, emit }">
      <button type="button" class="menu-item" @click="emit('detail')">
        詳細を表示
      </button>
      <button
        v-if="!row.protected"
        type="button"
        class="menu-item--danger"
        @click="emit('delete')"
      >
        削除
      </button>
      <span
        v-else
        class="block px-4 py-3 text-[15px] font-semibold text-slate-400 bg-[#fafafa] border-t border-slate-200 select-none"
      >
        削除不可（保護）
      </span>
    </template>
  </DashboardLayout>
</template>

<style scoped>
.menu-item {
  @apply block w-full text-left px-4 py-3 text-[15px] font-semibold hover:bg-[#f5f7fa] border-t first:border-t-0 border-slate-200;
}
.menu-item--danger {
  @apply block w-full text-left px-4 py-3 text-[15px] font-semibold text-red-600 hover:bg-[#fff1f1] border-t border-slate-200;
}
.status-active {
  @apply text-emerald-600 font-extrabold text-[18px];
}
.status-inactive {
  @apply text-red-600 font-extrabold text-[18px];
}
</style>
