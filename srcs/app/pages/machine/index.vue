<template>
  <DashboardLayout
    title="仮想マシンダッシュボード"
    :columns="columns"
    :rows="rowsForTable"
    rowKey="id"
    :headerButtons="headerButtons"
    @header-action="onHeaderAction"
    @row-action="handleRowAction"
  >
    <template #cell-name="{ row }">
      <NuxtLink :to="`/machine/${row.id}`" class="table-link">
        {{ row.name }}
      </NuxtLink>
    </template>

    <template #cell-instanceType="{ row }">
      <span class="text-sm">
        {{ row.instanceType.cpuCores }} cores /
        {{ convertByteToUnit(row.instanceType.memorySize, "GB") }} GB
      </span>
    </template>

    <template #cell-storage="{ row }">
      <span class="font-mono text-sm">
        {{ calculateTotalStorage(row.attachedStorages) }} GB
      </span>
    </template>

    <template #cell-node="{ row }">
      <span class="text-sm">{{ row.node.name }}</span>
    </template>

    <template #cell-status="{ row }">
      <span
        class="inline-flex select-none items-center rounded-md px-2 py-0.5 text-xs font-bold"
        :class="getVmStatusDisplay(row.status).class"
      >
        {{ getVmStatusDisplay(row.status).text }}
      </span>
    </template>

    <template #cell-createdAt="{ row }">
      <span class="text-sm font-mono">{{ formatDateTime(row.createdAt) }}</span>
    </template>

    <template #row-actions="{ row, emit }">
      <NuxtLink :to="`/machine/${row.id}`" class="action-item first:border-t-0">
        詳細
      </NuxtLink>
      <a href="#" class="action-item" @click.prevent="emit('edit')"> 編集 </a>
      <a
        href="#"
        class="action-item action-item-danger"
        @click.prevent="emit('delete')"
      >
        削除
      </a>
    </template>
  </DashboardLayout>

  <MoVirtualMachineCreate
    :show="activeModal === `create-${RESOURCE}`"
    @close="cancelAction"
    @success="handleSuccess"
  />
  <MoVirtualMachineEdit
    :show="activeModal === `edit-${RESOURCE}`"
    :virtual-machine="targetForEditing"
    @close="cancelAction"
    @success="handleSuccess"
  />
  <MoDeleteConfirm
    :show="activeModal === `delete-${RESOURCE}`"
    :is-loading="isDeleting"
    :resource-label="resourceLabel"
    :resource-name="targetForDeletion?.name"
    @close="cancelAction"
    @confirm="handleDelete"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";

// ==============================================================================
// 定数定義 (Constants)
// ==============================================================================

/**
 * @constant RESOURCE APIのエンドポイント名。useResourceListやusePageActionsで利用。
 */
const RESOURCE = "virtual-machines";

/**
 * @constant resourceLabel ユーザーに表示するリソースの名称（日本語）。モーダルなどで使用。
 */
const resourceLabel = "仮想マシン";

// ==============================================================================
// 状態管理 (State Management via Composables)
// ==============================================================================

/**
 * APIから仮想マシンの一覧データを取得・管理します。
 * `data` (virtualMachines) と `refresh` 関数を提供します。
 */
const { data: virtualMachines, refresh } =
  useResourceList<VirtualMachineDTO>(RESOURCE);

/**
 * テーブルコンポーネントに渡すためのリアクティブな行データ。
 * APIからのデータが`undefined`の場合でも安全に空配列を返すように`computed`を使用。
 */
const rowsForTable = computed<VirtualMachineDTO[]>(
  () => virtualMachines.value ?? []
);

/**
 * ページの主要なUIアクション（モーダル表示、編集、削除処理）を一元管理します。
 * これにより、ページコンポーネントはUIの宣言に集中できます。
 */
const {
  activeModal, // 現在アクティブなモーダルのID
  openModal, // モーダルを開く関数
  targetForDeletion, // 削除対象のデータ
  targetForEditing, // 編集対象のデータ
  isDeleting, // 削除処理の実行中フラグ
  handleRowAction, // 行アクション（編集/削除）を処理し、適切なモーダルを開く
  handleDelete, // 削除確認モーダルからの確定を受けて削除を実行
  handleSuccess, // 作成/編集モーダルの成功イベントを処理
  cancelAction, // モーダルを閉じるアクション
} = usePageActions<VirtualMachineDTO>({
  resourceName: RESOURCE,
  resourceLabel,
  refresh, // データ操作成功時に一覧を再読み込みさせるため
});

// ==============================================================================
// UI定義 (UI Definitions)
// ==============================================================================

/**
 * DashboardLayoutコンポーネントに渡すテーブルのカラム定義。
 * `key`はデータオブジェクトのプロパティ名に対応し、`#cell-{key}`スロットで使用される。
 */
const columns = [
  { key: "name", label: "仮想マシン名" },
  { key: "instanceType", label: "スペック (CPU/メモリ)" },
  { key: "storage", label: "ストレージ" },
  { key: "node", label: "配置ノード" },
  { key: "status", label: "状態" },
  { key: "createdAt", label: "作成日時" },
];

/**
 * DashboardLayoutコンポーネントのヘッダーに表示するボタンの定義。
 */
const headerButtons = [{ label: "新規作成", action: "create" }];

// ==============================================================================
// イベントハンドラ (Event Handlers)
// ==============================================================================

/**
 * DashboardLayoutから発火されたヘッダーアクションを処理します。
 * @param {string} action - 'create' などのアクション名
 */
const onHeaderAction = (action: string) => {
  if (action === "create") {
    // `usePageActions` を使って作成モーダルを開く
    openModal(`create-${RESOURCE}`);
  }
};
</script>
