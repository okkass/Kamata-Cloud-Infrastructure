<!-- app/pages/physical_node_management/index.vue -->
<template>
  <DashboardLayout
    title="物理ノードダッシュボード"
    :columns="columns"
    :rows="rows"
    rowKey="id"
    :headerButtons="headerButtons"
    :rowActions="rowActions"
    :valueClassMap="valueClassMap"
    @header-action="onHeaderAction"
    @row-action="onRowAction"
  >
    <!-- 管理ノードは名称に注記＆淡色 -->
    <template #cell-name="{ row }">
      <span :class="['font-semibold', row.isMgmt ? 'text-slate-400' : '']">
        {{ row.name
        }}<span v-if="row.isMgmt" class="ml-1 text-sm">（管理ノード）</span>
      </span>
    </template>

    <!-- 管理ノードは「削除不可」バッジ、他は通常メニュー -->
    <template #row-actions="{ row, emit }">
      <template v-if="row.isMgmt">
        <div class="action-item-disabled">削除不可</div>
      </template>
      <template v-else>
        <a href="#" class="action-item" @click.prevent="emit('delete')">
          削除
        </a>
        <a href="#" class="action-item" @click.prevent="emit('set-mgmt')">
          管理ノードに設定
        </a>
      </template>
    </template>
  </DashboardLayout>
</template>

<script setup>
import { reactive } from "vue";

const columns = [
  { key: "name", label: "ノード名" },
  { key: "ip", label: "IPアドレス" },
  { key: "status", label: "状態" },
  { key: "cpu", label: "CPU" },
  { key: "mem", label: "メモリ" },
  { key: "storage", label: "ストレージ" },
];

const rows = reactive([
  {
    id: "node-a",
    name: "Node-A",
    ip: "192.168.0.10",
    status: "稼働中",
    cpu: "70%",
    mem: "60%",
    storage: "80%",
    isMgmt: true,
  },
  {
    id: "node-b",
    name: "Node-B",
    ip: "192.168.0.11",
    status: "停止中",
    cpu: "—",
    mem: "—",
    storage: "—",
    isMgmt: false,
  },
  {
    id: "node-c",
    name: "Node-C",
    ip: "192.168.0.12",
    status: "稼働中",
    cpu: "45%",
    mem: "55%",
    storage: "30%",
    isMgmt: false,
  },
]);

const headerButtons = [{ label: "ノード追加", action: "create-node" }];

// フォールバック（slot未使用時）
const rowActions = [
  { label: "削除", action: "delete" },
  { label: "管理ノードに設定", action: "set-mgmt" },
];

const valueClassMap = {
  status: {
    稼働中: "text-emerald-600 font-extrabold text-[18px]",
    停止中: "text-red-600 font-extrabold text-[18px]",
  },
};

function onHeaderAction(action) {
  if (action === "create-node") alert("ノード追加を実行します");
}

function onRowAction({ action, row }) {
  if (action === "delete") alert(`${row.name} を削除します`);
  if (action === "set-mgmt") alert(`${row.name} を管理ノードに設定します`);
}
</script>
