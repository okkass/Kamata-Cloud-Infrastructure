<!-- app/pages/virtual_machine_management/index.vue -->
<template>
  <DashboardLayout
    title="仮想マシンダッシュボード"
    :columns="columns"
    :rows="rowsForTable"
    rowKey="id"
    :headerButtons="headerButtons"
    :valueClassMap="valueClassMap"
    @header-action="onHeaderAction"
    @row-action="onRowAction"
  >
    <!-- VM名（遷移しない表示のみ） -->
    <template #cell-name="{ row }">
      <span class="font-semibold text-slate-900">
        {{ row.name }}
        <span
          v-if="row.isSystem"
          class="ml-1 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-bold text-slate-600 align-middle"
        >
          システムVM
        </span>
      </span>
    </template>

    <!-- ステータス -->
    <template #cell-status="{ row }">
      <span
        class="inline-flex items-center rounded-md px-2 py-0.5 text-sm font-extrabold"
        :class="
          row.status === '稼働中'
            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
            : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
        "
      >
        {{ row.status }}
      </span>
    </template>

    <!-- CPU / MEM -->
    <template #cell-cpu="{ row }"
      ><span class="tabular-nums">{{ pct(row.cpu) }}</span></template
    >
    <template #cell-mem="{ row }"
      ><span class="tabular-nums">{{ pct(row.mem) }}</span></template
    >

    <!-- 行メニュー（押下でトーストのみ／遷移・モーダルなし） -->
    <template #row-actions="{ row, emit }">
      <a
        href="#"
        class="block px-4 py-3 text-[15px] font-semibold text-slate-900 hover:bg-[#f5f7fa] border-t first:border-t-0 border-slate-200"
        @click.prevent="emit('detail')"
        >詳細</a
      >

      <a
        href="#"
        class="block px-4 py-3 text-[15px] font-semibold text-slate-900 hover:bg-[#f5f7fa] border-t border-slate-200"
        @click.prevent="emit('edit')"
        >編集</a
      >

      <template v-if="!row.isSystem">
        <a
          href="#"
          class="block px-4 py-3 text-[15px] font-semibold text-red-600 hover:bg-red-50 border-t border-slate-200"
          @click.prevent="emit('delete')"
          >削除</a
        >
      </template>
      <template v-else>
        <div
          class="px-4 py-2 text-center text-sm font-bold text-white bg-slate-500 border border-slate-700 rounded-md select-none"
        >
          削除不可
        </div>
      </template>
    </template>
  </DashboardLayout>

  <!-- 作成モーダルだけ復活（トーストは出さない） -->
  <MoVirtualMachineCreate
    :show="activeModal === 'create-virtual-machine'"
    @close="closeModal"
    @success="onCreateSuccess"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";

/** 単数形：server/api/virtual-machine/* に合わせる */
const RESOURCE = "virtual-machines";

/** 一覧取得（undefined期間は空配列で受ける） */
const { data: virtualMachines, refresh } =
  useResourceList<VirtualMachineDTO>(RESOURCE);
const rowsForTable = computed<VirtualMachineDTO[]>(() =>
  Array.isArray(virtualMachines.value) ? virtualMachines.value : []
);

/** 作成モーダル用だけ使う */
const { activeModal, openModal, closeModal, handleSuccess } =
  usePageActions<VirtualMachineDTO>({
    resourceName: RESOURCE,
    resourceLabel: "仮想マシン",
    refresh,
  });

/** トースト（行メニュー用） */
const { addToast } = useToast();

/** テーブル定義 */
const columns = [
  { key: "name", label: "仮想マシン名" },
  { key: "network", label: "所属ネットワーク" },
  { key: "cpu", label: "CPU使用率" },
  { key: "mem", label: "メモリ使用率" },
  { key: "status", label: "状態" },
  { key: "createdAt", label: "作成日時" },
];

const headerButtons = [{ label: "新規作成", action: "create" }];

const valueClassMap = {
  status: {
    稼働中: "text-emerald-600 font-extrabold",
    停止中: "text-red-600 font-extrabold",
  },
};

const pct = (v: number | null | undefined) =>
  v === null || v === undefined ? "—" : `${v}%`;

/** ヘッダー：作成はモーダルを開く（トーストは出さない） */
const onHeaderAction = (action: string) => {
  if (action === "create") openModal("create-virtual-machine");
};

/** 行アクション：トーストだけ */
const onRowAction = ({
  action,
  row,
}: {
  action: string;
  row: VirtualMachineDTO;
}) => {
  if (action === "detail") {
    addToast({ message: `${row.name} の詳細（ダミー表示）`, type: "info" });
  } else if (action === "edit") {
    addToast({ message: `${row.name} の編集（ダミー表示）`, type: "info" });
  } else if (action === "delete") {
    addToast({ message: `${row.name} の削除（ダミー表示）`, type: "error" });
  } else {
    addToast({ message: `未対応アクション: ${action}`, type: "info" });
  }
};

/** 作成モーダル成功時：リフレッシュのみ（必要ならここでだけトースト可） */
const onCreateSuccess = async (payload?: unknown) => {
  await handleSuccess();
  await refresh();
};
</script>
