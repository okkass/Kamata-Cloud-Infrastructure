<!-- pages/security_group/index.vue -->
<script setup lang="ts">
import { ref, onUnmounted } from "vue";
import DashboardLayout from "~/components/DashboardLayout.vue";
import BaseModal from "~/components/BaseModal.vue";

type Row = {
  id: number | string;
  groupName: string;
  sgId: string;
  description: string;
  inRules: number;
  outRules: number;
};

const columns = [
  { key: "groupName", label: "グループ名" },
  { key: "sgId", label: "セキュリティグループID" },
  { key: "description", label: "説明" },
  { key: "rules", label: "イン/アウト ルール数" },
] as const;

const HEADER_BUTTONS = [{ label: "＋ 新規作成", action: "create" }] as const;
const ROW_ACTIONS = [
  { label: "編集", action: "edit" },
  { label: "削除", action: "delete" },
] as const;

const rows = ref<Row[]>([
  {
    id: 1,
    groupName: "default-web-server-sg",
    sgId: "sg-0123456789abcdef0",
    description:
      "デフォルトのWebサーバー用SG。HTTP/HTTPS(80/443)を社内ネットワークおよびCDNのエッジIPからのみ許可。メンテナンス期間中は一時的に22番ポートを開放し、時間経過で自動閉鎖。説明が長い場合の見え方確認用テキストです。運用手順は運用設計書参照。",
    inRules: 2,
    outRules: 1,
  },
  {
    id: 2,
    groupName: "db-server-sg",
    sgId: "sg-fedcba9876543210f",
    description:
      "DBサーバー用。特定のアプリケーションサブネットからのみ3306/TCPを許可。バックアップ時のみNFSの一時開放を実施。",
    inRules: 1,
    outRules: 1,
  },
]);

/* 説明の展開状態 */
const expandedDescId = ref<number | string | null>(null);
const toggleDesc = (id: number | string) => {
  expandedDescId.value = expandedDescId.value === id ? null : id;
};

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
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => (toast.value.show = false), ms);
}
onUnmounted(() => {
  if (toastTimer) clearTimeout(toastTimer);
});

const confirmOpen = ref(false);
const targetRow = ref<Row | null>(null);

function onHeader(action: string) {
  if (action === "create") {
    showToast("セキュリティグループ新規作成（仮）", "info");
  }
}
function onRow(payload: { action: string; row: Row }) {
  const { action, row } = payload;
  if (action === "edit") {
    showToast(`編集（仮）：${row.groupName}`, "info");
  } else if (action === "delete") {
    targetRow.value = row;
    confirmOpen.value = true;
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
    title="セキュリティグループダッシュボード"
    :columns="columns"
    :rows="rows"
    row-key="id"
    :header-buttons="HEADER_BUTTONS"
    :row-actions="ROW_ACTIONS"
    @header-action="onHeader"
    @row-action="onRow"
  >
    <!-- イン/アウト ルール数の整形表示 -->
    <template #cell-rules="{ row }">
      <span class="tabular-nums">{{ row.inRules }} / {{ row.outRules }}</span>
    </template>

    <!-- 説明：2行省略 + もっと見る/閉じる + ホバーツールチップ -->
    <template #cell-description="{ row }">
      <div class="space-y-1 max-w-[56ch]" :title="row.description">
        <p
          v-if="expandedDescId !== row.id"
          class="leading-snug text-[15px] text-slate-700 line-clamp-2 break-words"
        >
          {{ row.description }}
        </p>
        <p
          v-else
          class="leading-snug text-[15px] text-slate-700 whitespace-pre-wrap break-words"
        >
          {{ row.description }}
        </p>

        <button
          type="button"
          class="link-more"
          :aria-expanded="expandedDescId === row.id"
          @click.stop="toggleDesc(row.id)"
        >
          {{ expandedDescId === row.id ? "閉じる" : "もっと見る" }}
        </button>
      </div>
    </template>

    <!-- 行操作（aタグではなくbuttonでアクセシブルに） -->
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
          「<strong>{{ targetRow?.groupName }}</strong
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
/* 2行省略（line-clampプラグイン不要の簡易版） */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 行操作メニュー */
.menu-item {
  @apply block w-full text-left px-4 py-3 text-[15px] font-semibold hover:bg-[#f5f7fa] border-t first:border-t-0 border-slate-200;
}
.menu-item--danger {
  @apply block w-full text-left px-4 py-3 text-[15px] font-semibold text-red-600 hover:bg-[#fff1f1] border-t border-slate-200;
}

/* もっと見る/閉じる のリンク風ボタン */
.link-more {
  @apply text-[13px] font-semibold text-blue-600 hover:underline focus:outline-none;
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
