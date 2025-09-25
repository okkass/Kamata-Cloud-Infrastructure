<!-- pages/instance_type_management/index.vue -->
<script setup lang="ts">
import { ref, onUnmounted } from "vue";
import DashboardLayout from "~/components/DashboardLayout.vue";
import BaseModal from "~/components/BaseModal.vue";

type Row = {
  id: number | string;
  name: string;
  vcpu: number;
  memory: string;
  storage: string;
};

const columns = [
  { key: "name", label: "名前" },
  { key: "vcpu", label: "vCPU" },
  { key: "memory", label: "メモリ" },
  { key: "storage", label: "ストレージ" },
] as const;

const HEADER_BUTTONS = [
  { label: "インスタンスタイプ追加", action: "add" },
] as const;
const ROW_ACTIONS = [
  { label: "編集", action: "edit" },
  { label: "削除", action: "delete" },
] as const;

const rows = ref<Row[]>([
  { id: 1, name: "standard.small", vcpu: 2, memory: "4 GB", storage: "50 GB" },
  {
    id: 2,
    name: "standard.medium",
    vcpu: 4,
    memory: "8 GB",
    storage: "100 GB",
  },
  { id: 3, name: "compute.large", vcpu: 8, memory: "16 GB", storage: "200 GB" },
]);

/* ---- alert/confirm を使わない: Toast + 確認モーダル ---- */
type ToastKind = "info" | "success" | "error";
const toast = ref<{ show: boolean; msg: string; kind: ToastKind }>({
  show: false,
  msg: "",
  kind: "info",
});
let toastTimer: number | null = null;
function showToast(msg: string, kind: ToastKind = "info", ms = 2200) {
  toast.value = { show: true, msg, kind };
  if (toastTimer) clearTimeout(toastTimer as number);
  toastTimer = window.setTimeout(() => (toast.value.show = false), ms);
}
onUnmounted(() => {
  if (toastTimer) clearTimeout(toastTimer as number);
});

const confirmOpen = ref(false);
const targetRow = ref<Row | null>(null);

function onHeader(action: string) {
  if (action === "add") {
    // ここは後でモーダルやページ遷移に差し替え
    showToast("インスタンスタイプ追加（仮）", "info");
  }
}

function onRow(payload: { action: string; row: Row }) {
  const { action, row } = payload;
  if (action === "edit") {
    showToast(`編集（仮）：${row.name}`, "info");
  } else if (action === "delete") {
    targetRow.value = row;
    confirmOpen.value = true;
  } else if (action === "detail") {
    showToast(`詳細（仮）：${row.name}`, "info");
  }
}

function closeConfirm() {
  confirmOpen.value = false;
  targetRow.value = null;
}
function confirmDelete() {
  if (!targetRow.value) return;
  rows.value = rows.value.filter((r) => r.id !== targetRow.value!.id);
  closeConfirm();
  showToast("削除しました（仮）", "success");
}
</script>

<template>
  <DashboardLayout
    title="インスタンスタイプダッシュボード"
    :columns="columns"
    :rows="rows"
    row-key="id"
    :header-buttons="HEADER_BUTTONS"
    :row-actions="ROW_ACTIONS"
    @header-action="onHeader"
    @row-action="onRow"
  >
    <!-- 名前はリンク風。aではなくbuttonでアクセシブルに -->
    <template #cell-name="{ row, emit }">
      <button
        type="button"
        class="text-blue-600 hover:underline font-semibold"
        @click="emit('detail')"
      >
        {{ row.name }}
      </button>
    </template>

    <!-- 行操作（aタグではなくbuttonで統一） -->
    <template #row-actions="{ row, emit }">
      <button type="button" class="menu-item" @click="emit('edit')">
        編集
      </button>
      <button type="button" class="menu-item--danger" @click="emit('delete')">
        削除
      </button>
    </template>
  </DashboardLayout>

  <!-- 削除確認モーダル -->
  <teleport to="body">
    <BaseModal v-if="confirmOpen" title="削除の確認" @close="closeConfirm">
      <div class="space-y-4">
        <p class="text-sm text-slate-700">
          「<strong>{{ targetRow?.name }}</strong
          >」を削除しますか？
        </p>
        <div class="flex justify-end gap-2">
          <button type="button" class="btn" @click="closeConfirm">
            キャンセル
          </button>
          <button type="button" class="btn--danger" @click="confirmDelete">
            削除する
          </button>
        </div>
      </div>
    </BaseModal>
  </teleport>

  <!-- Toast -->
  <teleport to="body">
    <div
      v-show="toast.show"
      class="toast"
      :class="{
        'toast--info': toast.kind === 'info',
        'toast--success': toast.kind === 'success',
        'toast--error': toast.kind === 'error',
      }"
      role="status"
      aria-live="polite"
    >
      {{ toast.msg }}
    </div>
  </teleport>
</template>

<style scoped>
/* 行メニュー */
.menu-item {
  @apply block w-full text-left px-4 py-3 text-[15px] font-semibold hover:bg-[#f5f7fa] border-t first:border-t-0 border-slate-200;
}
.menu-item--danger {
  @apply block w-full text-left px-4 py-3 text-[15px] font-semibold text-red-600 hover:bg-[#fff1f1] border-t border-slate-200;
}

/* Confirm モーダル用ボタン */
.btn {
  @apply rounded-xl border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200;
}
.btn--danger {
  @apply rounded-xl bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-200;
}

/* Toast */
.toast {
  @apply fixed right-4 bottom-4 z-[5000] px-4 py-3 rounded-lg shadow-lg text-sm font-semibold text-white transition-opacity;
}
.toast--info {
  @apply bg-slate-800;
}
.toast--success {
  @apply bg-emerald-600;
}
.toast--error {
  @apply bg-red-600;
}
</style>
