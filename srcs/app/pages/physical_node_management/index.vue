<template>
  <!-- 横スクロールを許可（列がオーバーする場合にスクロール） -->
  <div class="overflow-x-auto">
    <DashboardLayout
      title="物理ノードダッシュボード"
      :columns="columns"
      :rows="nodesUi"
      rowKey="id"
      :headerButtons="headerButtons"
      @header-action="handleHeaderAction"
    >
      <!-- name だけリンク化（他列は汎用表示。省略表示はCSSで無効化） -->
      <template #cell-name="{ row }">
        <NuxtLink :to="`/physical-node/${row.id}`">
          {{ row.name }} <span v-if="row.isMgmt">（管理ノード）</span>
        </NuxtLink>
      </template>

      <!-- 行メニュー（既存スタイル踏襲） -->
      <template #row-actions="{ row }">
        <NuxtLink
          :to="`/physical-node/${row.id}`"
          class="block px-4 py-3 text-[15px] font-semibold text-slate-900 hover:bg-[#f5f7fa] border-t first:border-t-0 border-slate-200"
        >
          詳細
        </NuxtLink>

        <button
          type="button"
          class="block w-full text-left px-4 py-3 text-[15px] font-semibold border-t border-slate-200"
          :class="
            row.isMgmt || switchingId === row.id
              ? 'text-slate-400 cursor-not-allowed'
              : 'text-slate-900 hover:bg-[#f5f7fa]'
          "
          :disabled="row.isMgmt || switchingId === row.id"
          @click.stop.prevent="switchManagementNodeToTarget(row.id)"
        >
          管理ノードに設定
        </button>

        <button
          type="button"
          class="block w-full text-left px-4 py-3 text-[15px] font-semibold border-t border-slate-200"
          :class="
            row.isMgmt
              ? 'text-slate-300 cursor-not-allowed'
              : 'text-red-600 hover:bg-red-50'
          "
          :disabled="row.isMgmt"
          @click.stop.prevent="handleDeleteRowClick(row)"
        >
          削除
        </button>
      </template>
    </DashboardLayout>
  </div>

  <!-- モーダル（nodes は渡さない＝モーダル自身に検出させる） -->
  <MoDeleteConfirm
    :show="activeModal === 'delete-physical-nodes'"
    :message="`本当に '${targetForDeletion?.name}' を削除しますか？`"
    :is-loading="isDeleting"
    @close="cancelAction"
    @confirm="handleDelete"
  />
  <MoAddNodeToCluster
    :show="activeModal === 'create-physical-nodes'"
    @close="closeModal"
    @submit="handleCreateFromCandidate"
  />
</template>

<script setup lang="ts">
import { ref, computed, type Ref } from "vue";
import MoDeleteConfirm from "@/components/MoDeleteConfirm.vue";
import MoAddNodeToCluster from "@/components/MoAddNodeToCluster.vue";
import { useToast } from "@/composables/useToast";

/** =========================
 * 型定義（camelCase / 型安全性）
 * ========================= */
type PhysicalNodeDto = {
  id: string;
  name: string;
  ipAddress: string;
  status: "active" | "inactive";
  isAdmin: boolean;
  createdAt: string;
  cpuUtilization?: number;
  memoryUtilization?: number;
  storageUtilization?: number;
};

type UiNode = {
  id: string;
  name: string;
  ip: string;
  status: "稼働中" | "停止中";
  cpu: string;
  mem: string;
  storage: string;
  isMgmt: boolean;
  createdAtText: string;
};

type TableColumn = {
  key: keyof UiNode | string;
  label: string;
  width?: number | string; // px / % / auto
  maxWidth?: number | string; // px / %
  align?: "left" | "center" | "right";
};

type UseResourceListReturn<T> = {
  data: Ref<T[] | null | undefined>;
  refresh: () => Promise<void>;
};

type UsePageActionsReturn<Row> = {
  activeModal: Ref<string | null>;
  openModal: (name: string) => void;
  closeModal: () => void;
  targetForDeletion: Ref<Row | null>;
  isDeleting: Ref<boolean>;
  handleRowAction: (p: { action: string; row: Row }) => void;
  handleDelete: () => Promise<void>;
  handleSuccess: () => void;
  cancelAction: () => void;
};

/** =========================
 * 定数（UPPER_SNAKE_CASE）
 * ========================= */
const API_ENDPOINTS = {
  BASE: "/api/physical-nodes",
  SET_ADMIN: (id: string) =>
    `/api/physical-nodes/${encodeURIComponent(id)}/set-admin`,
  UNSET_ADMIN: (id: string) =>
    `/api/physical-nodes/${encodeURIComponent(id)}/unset-admin`,
} as const;

const DEFAULT_TOAST_DURATION_MS = 2200;

/** =========================
 * composable
 * ========================= */
const { addToast } = useToast();

/** =========================
 * データ取得 / ページアクション
 * ========================= */
const { data: nodesRaw, refresh } = useResourceList<PhysicalNodeDto>(
  "physical-nodes"
) as UseResourceListReturn<PhysicalNodeDto>;

const {
  activeModal,
  openModal,
  closeModal,
  targetForDeletion,
  isDeleting,
  handleRowAction,
  handleDelete,
  handleSuccess,
  cancelAction,
} = usePageActions<UiNode>({
  resourceName: "physical-nodes",
  resourceLabel: "物理ノード",
  refresh,
}) as unknown as UsePageActionsReturn<UiNode>;

/** =========================
 * 列（すべて明示・省略なし）
 * ========================= */
const columns = ref<TableColumn[]>([
  { key: "name", label: "ノード名", width: 260, maxWidth: 360 },
  { key: "ip", label: "IPアドレス", width: 180, maxWidth: 220 },
  { key: "status", label: "状態", width: 120, align: "center" },
  { key: "cpu", label: "CPU", width: 120, align: "right" },
  { key: "mem", label: "メモリ", width: 120, align: "right" },
  { key: "storage", label: "ストレージ", width: 140, align: "right" },
  { key: "createdAtText", label: "作成日時", width: 200, maxWidth: 220 },
]);

const headerButtons = ref<{ label: string; action: string }[]>([
  { label: "ノード追加", action: "create" },
]);

/** =========================
 * 整形ユーティリティ
 * ========================= */
function formatAsPercent(value?: number): string {
  return typeof value === "number" && isFinite(value)
    ? `${Math.round(value * 100)}%`
    : "—";
}

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(
    date.getDate()
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** =========================
 * UIノード（createdAt → createdAtText）
 * ========================= */
const nodesUi = computed<UiNode[]>(() =>
  (nodesRaw.value ?? []).map((n) => ({
    id: n.id,
    name: n.name,
    ip: n.ipAddress,
    status: n.status === "active" ? "稼働中" : "停止中",
    cpu: formatAsPercent(n.cpuUtilization),
    mem: formatAsPercent(n.memoryUtilization),
    storage: formatAsPercent(n.storageUtilization),
    isMgmt: Boolean(n.isAdmin),
    createdAtText: formatDateTime(n.createdAt),
  }))
);

/** =========================
 * 管理ノード切替（解除は並列・詳細理由を提示）
 * ========================= */
const switchingId = ref<string | null>(null);

async function switchManagementNodeToTarget(targetId: string): Promise<void> {
  if (switchingId.value === targetId) return;

  const target = nodesUi.value.find((n) => n.id === targetId);
  if (!target || target.isMgmt) return;

  switchingId.value = targetId;
  try {
    const currentAdminIds = (nodesRaw.value ?? [])
      .filter((n) => n.isAdmin && n.id !== targetId)
      .map((n) => n.id);

    const unsetResults = await Promise.allSettled(
      currentAdminIds.map((id) =>
        $fetch(API_ENDPOINTS.UNSET_ADMIN(id), { method: "PUT" })
      )
    );
    const failedMessages = unsetResults
      .filter((r): r is PromiseRejectedResult => r.status === "rejected")
      .map((r) =>
        r.reason instanceof Error ? r.reason.message : String(r.reason)
      );

    if (failedMessages.length > 0) {
      console.error("管理ノード解除エラー詳細:", failedMessages);
      addToast({
        type: "warning",
        message: `一部の既存管理ノード解除に失敗（${failedMessages.length}件）。続行します。`,
        details: failedMessages.slice(0, 3).join(" | "),
        duration: DEFAULT_TOAST_DURATION_MS,
      });
    }

    await $fetch(API_ENDPOINTS.SET_ADMIN(targetId), { method: "PUT" });

    await refresh();
    handleSuccess();
    addToast({
      type: "success",
      message: "管理ノードを切り替えました。",
      duration: DEFAULT_TOAST_DURATION_MS,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("管理ノード切替エラー:", msg);
    addToast({
      type: "error",
      message: "管理ノードの切替に失敗しました。",
      details: msg,
      duration: DEFAULT_TOAST_DURATION_MS,
    });
  } finally {
    switchingId.value = null;
  }
}

/** =========================
 * 削除
 * ========================= */
function handleDeleteRowClick(row: UiNode): void {
  if (row.isMgmt) return;
  handleRowAction({ action: "delete", row });
}

/** =========================
 * 追加（モーダルは“ただ開く”。検出はモーダルに任せる）
 * ========================= */
async function handleHeaderAction(action: string): Promise<void> {
  if (action !== "create") return;
  openModal("create-physical-nodes");
}

async function handleCreateFromCandidate(c: {
  id: string;
  name: string;
  ipAddress: string;
}): Promise<void> {
  try {
    await $fetch(API_ENDPOINTS.BASE, {
      method: "POST",
      body: { name: c.name, ipAddress: c.ipAddress },
    });
    await refresh();
    handleSuccess();
    closeModal();
    addToast({
      type: "success",
      message: `ノード '${c.name}' を追加しました。`,
      duration: DEFAULT_TOAST_DURATION_MS,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("ノード追加エラー:", msg);
    addToast({
      type: "error",
      message: "ノードの追加に失敗しました。",
      details: msg,
      duration: DEFAULT_TOAST_DURATION_MS,
    });
  }
}
</script>

<style scoped>
/* DashboardLayout 内部が table の場合の横スクロール最適化 */
:deep(table) {
  table-layout: auto; /* セル内容に合わせて伸長 */
  min-width: 980px; /* 必要に応じて調整 */
}

/* 省略（三点リーダ）を完全無効化：セル/ヘッダ/内包要素すべて */
:deep(th),
:deep(td) {
  white-space: nowrap;
  overflow: visible;
  text-overflow: clip;
  max-width: none;
}

/* DashboardLayout 側が .truncate を付けている場合の強制解除 */
:deep(.truncate) {
  overflow: visible !important;
  text-overflow: clip !important;
  white-space: nowrap !important;
}

/* セル内のスパンや div にも ellipsis ユーティリティが当たっている場合の保険 */
:deep(td span),
:deep(td div),
:deep(th span),
:deep(th div) {
  overflow: visible;
  text-overflow: clip;
}
</style>
