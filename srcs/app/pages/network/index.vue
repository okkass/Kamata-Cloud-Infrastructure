<template>
  <div class="vnet-page min-h-screen bg-slate-100 p-8">
    <DashboardLayout
      title="仮想ネットワークダッシュボード"
      :columns="columns"
      :rows="rows"
      row-key="name"
      :header-buttons="headerButtons"
      :row-actions="rowActions"
      @header-action="onHeaderAction"
      @row-action="onRowAction"
    />
  </div>
</template>
<script setup lang="ts">
import DashboardLayout from "@/components/DashboardLayout.vue";

type VNet = { name: string; cidr: string; subnets: number };
type ColumnDef = { key: keyof VNet | string; label: string };

const columns: ColumnDef[] = [
  { key: "name", label: "仮想ネットワーク名" },
  { key: "cidr", label: "アドレス範囲" },
  { key: "subnets", label: "サブネット数" },
]; // ← as const は付けない

const rows: VNet[] = [
  { name: "dev-network", cidr: "192.168.0.0/16", subnets: 2 },
  { name: "test-network", cidr: "10.0.0.0/8", subnets: 1 },
];

const headerButtons = [
  { label: "＋ 仮想ネットワーク新規作成", action: "create" },
];
const rowActions = [
  { label: "編集", action: "edit" },
  { label: "一時停止", action: "pause" },
  { label: "削除", action: "delete" },
];

function onHeaderAction(action: string) {
  if (action === "create") console.log("create vnet");
}
function onRowAction(e: { action: string; row: VNet }) {
  console.log(e.action, e.row);
}
</script>

<!-- Tailwindの@layerは使わず、純CSSで“常時表示”を強制 -->
<!--
<style>
.vnet-page .dl-actions-cell .menu-trigger {
  opacity: 1 !important;
  visibility: visible !important;
  pointer-events: auto !important;
  display: inline-flex !important;
}
</style>
-->
