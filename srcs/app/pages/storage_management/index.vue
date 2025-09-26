<!-- pages/storage/index.vue（or 既存のパスに合わせて配置） -->
<script setup lang="ts">
import { ref, onUnmounted } from "vue";
import DashboardLayout from "~/components/DashboardLayout.vue";
import BaseModal from "~/components/BaseModal.vue";

type Row = {
  id: number | string;
  poolName: string;
  type: "local" | "network";
  node: string;
  sizeGB: number;
  usedGB: number;
};

const columns = [
  { key: "poolName", label: "ストレージプール名" },
  { key: "type", label: "タイプ" },
  { key: "node", label: "ノード" },
  { key: "size", label: "サイズ" },
  { key: "used", label: "使用済みデータ量" },
  { key: "usage", label: "使用率" },
] as const;

const HEADER_BUTTONS = [
  { label: "ローカルストレージ追加", action: "add-local" },
  { label: "ネットワークストレージ追加", action: "add-network" },
] as const;

const ROW_ACTIONS = [
  { label: "詳細", action: "detail" },
  { label: "編集", action: "edit" },
  { label: "削除", action: "delete" },
] as const;

const rows = ref<Row[]>([
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
]);

/* ------- Toast ------- */
type ToastKind = "info" | "success" | "error";
const toast = ref<{ show: boolean; msg: string; kind: ToastKind }>({
  show: false,
  msg: "",
  kind: "info",
});
let toastTimer: number | null = null;
function showToast(msg: string, kind: ToastKind = "info", ms = 2200) {
  toast.value = { show: true, msg, kind };
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => (toast.value.show = false), ms);
}
onUnmounted(() => {
  if (toastTimer) clearTimeout(toastTimer);
});

/* ------- Confirm (削除) ------- */
const confirmOpen = ref(false);
const targetRow = ref<Row | null>(null);
function openDelete(row: Row) {
  targetRow.value = row;
  confirmOpen.value = true;
}
function closeConfirm() {
  confirmOpen.value = false;
  targetRow.value = null;
}
function confirmDelete() {
  if (!targetRow.value) return;
  rows.value = rows.value.filter((r) => r.id !== targetRow.value!.id);
  closeConfirm();
  showToast("削除しました。", "success");
}

/* ------- Header actions ------- */
function onHeader(action: string) {
  if (action === "add-local") showToast("ローカルストレージ追加（仮）", "info");
  if (action === "add-network")
    showToast("ネットワークストレージ追加（仮）", "info");
}

/* ------- Row actions ------- */
function onRow({ action, row }: { action: string; row: Row }) {
  if (action === "detail") {
    showToast(`詳細: ${row.poolName}`, "info");
  } else if (action === "edit") {
    showToast(`編集: ${row.poolName}`, "info");
  } else if (action === "delete") {
    openDelete(row);
  }
}

/* ------- helpers ------- */
const percent = (r: Row) =>
  Math.min(100, Math.round((r.usedGB / r.sizeGB) * 100));
const barClass = (p: number) =>
  p <= 70 ? "bar-ok" : p <= 90 ? "bar-warn" : "bar-bad";
</script>

<template>
  <DashboardLayout
    title="ストレージ管理ダッシュボード"
    :columns="columns"
    :rows="rows"
    row-key="id"
    :header-buttons="HEADER_BUTTONS"
    :row-actions="ROW_ACTIONS"
    @header-action="onHeader"
    @row-action="onRow"
  >
    <!-- タイプ：バッジ表示 -->
    <template #cell-type="{ row }">
      <span
        class="badge"
        :class="row.type === 'local' ? 'badge-local' : 'badge-network'"
      >
        {{ row.type === "local" ? "ローカル" : "ネットワーク" }}
      </span>
    </template>

    <!-- サイズ / 使用量：桁揃え -->
    <template #cell-size="{ row }">
      <span class="num">{{ row.sizeGB }} GB</span>
    </template>
    <template #cell-used="{ row }">
      <span class="num">{{ row.usedGB }} GB</span>
    </template>

    <!-- 使用率：プログレスバー＋%表示 -->
    <template #cell-usage="{ row }">
      <div class="usage-wrap">
        <div class="usage-rail">
          <div
            class="usage-bar"
            :class="barClass(percent(row))"
            :style="{ width: percent(row) + '%' }"
          />
        </div>
        <div class="usage-label num">{{ percent(row) }}%</div>
      </div>
    </template>

    <!-- 行操作：アンカーではなく button でアクセシブルに -->
    <template #row-actions="{ row, emit }">
      <button type="button" class="menu-item" @click="emit('detail')">
        詳細
      </button>
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
          「<strong>{{ targetRow?.poolName }}</strong
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
/* --- 共通化したユーティリティクラス --- */
.badge {
  @apply inline-flex items-center rounded-full px-3 py-1 text-[12px] font-bold ring-1;
}
.badge-local {
  @apply bg-emerald-50 text-emerald-700 ring-emerald-200;
}
.badge-network {
  @apply bg-sky-50     text-sky-700     ring-sky-200;
}
.num {
  @apply tabular-nums;
}

/* 使用率バー */
.usage-wrap {
  @apply min-w-[160px];
}
.usage-rail {
  @apply h-2.5 w-full rounded-full bg-slate-200 overflow-hidden;
}
.usage-bar {
  @apply h-2.5 rounded-full transition-all;
}
.bar-ok {
  @apply bg-emerald-500;
}
.bar-warn {
  @apply bg-amber-500;
}
.bar-bad {
  @apply bg-red-500;
}
.usage-label {
  @apply mt-1 text-right text-[13px] font-semibold;
}

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
