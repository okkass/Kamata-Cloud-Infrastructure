<template>
  <DashboardLayout
    title="物理ノードダッシュボード"
    :columns="columns"
    :rows="nodesUi"
    rowKey="id"
    :headerButtons="headerButtons"
    @header-action="handleHeaderAction"
  >
    <!-- name だけリンク化 -->
    <template #cell-name="{ row }">
      <NuxtLink :to="`/physical-node/${row.id}`">
        {{ row.name }} <span v-if="row.isMgmt">（管理ノード）</span>
      </NuxtLink>
    </template>

    <!-- 行メニュー -->
    <template #row-actions="{ row }">
      <NuxtLink
        :to="`/physical-node/${row.id}`"
        class="block px-4 py-3 text-[15px] font-semibold text-slate-900 hover:bg-[#f5f7fa] border-t first:border-t-0 border-slate-200"
        >詳細</NuxtLink
      >

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

  <!-- モーダル -->
  <MoDeleteConfirm
    :show="activeModal === 'delete-physical-nodes'"
    :message="`本当に '${targetForDeletion?.name}' を削除しますか？`"
    :is-loading="isDeleting"
    @close="cancelAction"
    @confirm="handleDelete"
  />
  <MoAddNodeToCluster
    :show="activeModal === 'create-physical-nodes'"
    :nodes="candidateNodes"
    @close="closeModal"
    @submit="handleCreateFromCandidate"
  />
</template>

<script setup lang="ts">
import { ref, computed, type Ref } from "vue";
import MoDeleteConfirm from "@/components/MoDeleteConfirm.vue";
import MoAddNodeToCluster from "@/components/MoAddNodeToCluster.vue";
import { useToast } from "@/composables/useToast";

/* ========= 型 ========= */
type PhysicalNodeDTO = {
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
type CandidateDTO = { id: string; name: string; ipAddress: string };
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
/* usePageActions の実体に合わせて Ref を明示 */
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

const { addToast } = useToast();

/* ========= API ========= */
const API = {
  base: "/api/physical-nodes",
  candidates: "/api/physical-nodes/candidates",
  setAdmin: (id: string) =>
    `/api/physical-nodes/${encodeURIComponent(id)}/set-admin`,
  unsetAdmin: (id: string) =>
    `/api/physical-nodes/${encodeURIComponent(id)}/unset-admin`,
} as const;

/* ========= データ取得 ========= */
const { data: nodesRaw, refresh } = useResourceList<PhysicalNodeDTO>(
  "physical-nodes"
) as UseResourceListReturn<PhysicalNodeDTO>;

/* actions は分割代入＋ Ref 型で受ける（テンプレでは自動unref） */
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
}: UsePageActionsReturn<UiNode> = usePageActions<UiNode>({
  resourceName: "physical-nodes",
  resourceLabel: "物理ノード",
  refresh,
}) as unknown as UsePageActionsReturn<UiNode>;

/* ========= 列（createdAtText を使用・幅/最大幅を汎用制御） ========= */
const columns = ref<TableColumn[]>([
  { key: "name", label: "ノード名", width: 260, maxWidth: 360 },
  { key: "ip", label: "IPアドレス", width: 180, maxWidth: 220 },
  { key: "status", label: "状態", width: 120, align: "center" },
  { key: "cpu", label: "CPU", width: 120, align: "right" },
  { key: "mem", label: "メモリ", width: 120, align: "right" },
  { key: "storage", label: "ストレージ", width: 140, align: "right" },
  { key: "createdAtText", label: "作成日時", width: 200, maxWidth: 220 },
]);

/* ここを readonly にしない（as const は外す） */
const headerButtons = ref<{ label: string; action: string }[]>([
  { label: "ノード追加", action: "create" },
]);

/* ========= 整形 ========= */
function formatAsPercent(v?: number): string {
  return typeof v === "number" && isFinite(v) ? `${Math.round(v * 100)}%` : "—";
}
function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(
    d.getHours()
  )}:${p(d.getMinutes())}`;
}
function extractErrorMessages(
  results: PromiseSettledResult<unknown>[]
): string[] {
  return results
    .filter((r): r is PromiseRejectedResult => r.status === "rejected")
    .map((r) => {
      const reason = r.reason;
      if (reason instanceof Error) return reason.message;
      try {
        return typeof reason === "string" ? reason : JSON.stringify(reason);
      } catch {
        return String(reason);
      }
    });
}

/* ========= UIノード ========= */
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

/* ========= 管理ノード切替 ========= */
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
      currentAdminIds.map((id) => $fetch(API.unsetAdmin(id), { method: "PUT" }))
    );
    const failedMessages = extractErrorMessages(unsetResults);
    if (failedMessages.length > 0) {
      console.error("管理ノード解除エラー詳細:", failedMessages);
      addToast({
        type: "warning",
        message: `一部の既存管理ノード解除に失敗（${failedMessages.length}件）。続行します。`,
        details: failedMessages.slice(0, 3).join(" | "),
      });
    }

    await $fetch(API.setAdmin(targetId), { method: "PUT" });

    await refresh();
    handleSuccess();
    addToast({ type: "success", message: "管理ノードを切り替えました。" });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("管理ノード切替エラー:", msg);
    addToast({
      type: "error",
      message: "管理ノードの切替に失敗しました。",
      details: msg,
    });
  } finally {
    switchingId.value = null;
  }
}

/* ========= 削除 ========= */
function handleDeleteRowClick(row: UiNode): void {
  if (row.isMgmt) return;
  handleRowAction({ action: "delete", row });
}

/* ========= 追加 ========= */
const candidateNodes = ref<CandidateDTO[]>([]);

async function handleHeaderAction(action: string): Promise<void> {
  if (action !== "create") return;
  try {
    candidateNodes.value = await $fetch<CandidateDTO[]>(API.candidates);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("候補ノード取得エラー:", msg);
    candidateNodes.value = [];
    addToast({
      type: "error",
      message: "候補ノードの取得に失敗しました。",
      details: msg,
    });
  }
  openModal("create-physical-nodes");
}

async function handleCreateFromCandidate(c: CandidateDTO): Promise<void> {
  try {
    await $fetch(API.base, {
      method: "POST",
      body: { name: c.name, ipAddress: c.ipAddress },
    });
    await refresh();
    handleSuccess();
    closeModal();
    addToast({
      type: "success",
      message: `ノード '${c.name}' を追加しました。`,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("ノード追加エラー:", msg);
    addToast({
      type: "error",
      message: "ノードの追加に失敗しました。",
      details: msg,
    });
  }
}
</script>
