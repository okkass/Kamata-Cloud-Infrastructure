<!-- app/pages/storage/index.vue -->
<template>
  <DashboardLayout
    title="ストレージ管理"
    :columns="columns"
    :rows="rows"
    rowKey="id"
    :headerButtons="headerButtons"
    @header-action="onHeaderAction"
    @row-action="onRowAction"
  >
    <template #cell-name="{ row }">
      <NuxtLink :to="`/storage/${row.id}`" class="table-link">
        {{ row.name }}
      </NuxtLink>
    </template>

    <template #cell-type="{ row }">
      <span>{{ row.type }}</span>
    </template>

    <template #cell-node="{ row }">
      <span>{{ row.node }}</span>
    </template>

    <template #cell-size="{ row }">
      <span class="font-mono">{{ row.size }}</span>
    </template>

    <template #cell-used="{ row }">
      <span class="font-mono">{{ row.used }}</span>
    </template>

    <template #cell-usage="{ row }">
      <span>{{ row.usage }}</span>
    </template>

    <template #row-actions="{ row }">
      <NuxtLink :to="`/storage/${row.id}`" class="action-item"> 詳細 </NuxtLink>
      <button
        type="button"
        class="action-item"
        @click.stop.prevent="onRowAction({ action: 'edit', row })"
      >
        編集
      </button>
      <button
        type="button"
        class="action-item action-item-danger"
        @click.stop.prevent="onRowAction({ action: 'delete', row })"
      >
        削除
      </button>
    </template>
  </DashboardLayout>

  <!-- 追加モーダル -->
  <div
    v-if="activeModal === ADD_STORAGE_ACTION"
    class="modal-backdrop"
    @click.self="cancelAction"
  >
    <div class="modal">
      <h3>ストレージプール追加（{{ addType }}）</h3>
      <label>
        プール名
        <input v-model="form.name" type="text" />
      </label>
      <label>
        ノード
        <input v-model="form.node" type="text" />
      </label>
      <label>
        サイズ
        <input v-model="form.size" type="text" placeholder="例: 1000GB" />
      </label>
      <div class="modal-actions">
        <button type="button" class="btn" @click="cancelAction">
          キャンセル
        </button>
        <button type="button" class="btn btn-primary" @click="submitAdd">
          追加
        </button>
      </div>
    </div>
  </div>

  <!-- 編集モーダル -->
  <div
    v-if="activeModal === EDIT_STORAGE_ACTION && targetForEditing"
    class="modal-backdrop"
    @click.self="cancelAction"
  >
    <div class="modal">
      <h3>ストレージプール編集</h3>
      <label>
        プール名
        <input v-model="form.name" type="text" />
      </label>
      <label>
        ノード
        <input v-model="form.node" type="text" />
      </label>
      <label>
        サイズ
        <input v-model="form.size" type="text" />
      </label>
      <div class="modal-actions">
        <button type="button" class="btn" @click="cancelAction">
          キャンセル
        </button>
        <button type="button" class="btn btn-primary" @click="submitEdit">
          保存
        </button>
      </div>
    </div>
  </div>

  <!-- 削除モーダル -->
  <MoDeleteConfirm
    :show="activeModal === DELETE_STORAGE_ACTION"
    :message="`本当にストレージプール「${
      (targetForDeletion && targetForDeletion.name) || ''
    }」を削除しますか？`"
    :is-loading="isDeleting"
    @close="cancelAction"
    @confirm="handleDelete"
  />
</template>

<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import DashboardLayout from "@/components/DashboardLayout.vue";
import MoDeleteConfirm from "@/components/MoDeleteConfirm.vue";
import { usePageActions } from "@/composables/usePageActions";
import {
  useStorageManagement,
  createPool,
  updatePool,
  type StorageRow,
  ADD_STORAGE_ACTION,
  EDIT_STORAGE_ACTION,
  DELETE_STORAGE_ACTION,
} from "~/composables/dashboard/useStorageManagement";
import { STORAGE } from "@/utils/constants";

const { columns, headerButtons, rows, refresh } = useStorageManagement();

const form = reactive({
  name: "",
  node: "",
  size: "",
});

const addType = ref<StorageRow["type"]>("ローカル");

const {
  activeModal,
  openModal,
  targetForDeletion,
  targetForEditing,
  isDeleting,
  handleRowAction,
  handleDelete,
  handleSuccess,
  cancelAction,
} = usePageActions<StorageRow>({
  resourceName: STORAGE.name, // delete-◯◯ の整合性用
  resourceLabel: "ストレージプール",
  refresh,
});

watch(
  () => targetForEditing.value,
  (row) => {
    if (row) {
      form.name = row.name ?? "";
      form.node = row.node ?? "";
      form.size = row.size ?? "";
    } else {
      form.name = "";
      form.node = "";
      form.size = "";
    }
  }
);

const onHeaderAction = (action: string) => {
  addType.value = action === "add-network" ? "ネットワーク" : "ローカル";
  openModal?.(ADD_STORAGE_ACTION);
};

const onRowAction = ({ action, row }: { action: string; row: StorageRow }) => {
  if (action === "edit") {
    targetForEditing.value = row;
    openModal?.(EDIT_STORAGE_ACTION);
    return;
  }
  handleRowAction({ action, row });
};

async function submitAdd() {
  if (!form.name || !form.node || !form.size) return;

  await createPool({
    name: form.name,
    node: form.node,
    size: form.size,
    type: addType.value,
  });

  await refresh?.();
  handleSuccess?.();
  cancelAction?.();
}

async function submitEdit() {
  if (!targetForEditing.value) return;

  await updatePool(targetForEditing.value.id, {
    name: form.name,
    node: form.node,
    size: form.size,
  });

  await refresh?.();
  handleSuccess?.();
  cancelAction?.();
}
</script>
