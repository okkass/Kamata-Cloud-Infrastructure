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
      <template v-if="row.isAdmin">
        <div
          class="w-full text-center px-4 py-2 text-sm font-bold text-white bg-slate-500 border border-slate-700 rounded-md cursor-not-allowed select-none"
        >
          削除不可
        </div>
      </template>
      <template v-else>
        <a
          href="#"
          class="block px-4 py-3 text-[15px] font-semibold text-slate-900 hover:bg-[#f5f7fa] border-t first:border-t-0 border-slate-200"
          @click.prevent="emit('delete')"
          >削除</a
        >
        <a
          href="#"
          class="block px-4 py-3 text-[15px] font-semibold text-slate-900 hover:bg-[#f5f7fa] border-t first:border-t-0 border-slate-200"
          @click.prevent="emit('set-mgmt')"
          >管理ノードに設定</a
        >
      </template>
    </template>
  </DashboardLayout>
</template>

<script setup>
import { reactive } from "vue";

// ここはAPI仕様を踏まえて適宜調整してください
const columns = [
  { key: "name", label: "ノード名" },
  { key: "ipAddress", label: "IPアドレス" },
  { key: "status", label: "状態" },
  { key: "cpuUtilization", label: "CPU" },
  { key: "memoryUtilization", label: "メモリ" },
  { key: "storageUtilization", label: "ストレージ" },
];

// データの取得
const { data } = await useFetch("/api/physical-nodes");

// データの整形
let val = data.value;
for (let i = 0; i < val.length; i++) {
  val[i].status = "active" ? "稼働中" : "停止中";
  val[i].cpuUtilization = (val[i].cpuUtilization * 100).toFixed(1) + "%";
  val[i].memoryUtilization = (val[i].memoryUtilization * 100).toFixed(1) + "%";
  val[i].storageUtilization =
    (val[i].storageUtilization * 100).toFixed(1) + "%";
}

// リアクティブにする
const rows = reactive(val || []);

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
