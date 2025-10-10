<template>
  <DashboardLayout
    title="物理ノードダッシュボード"
    :columns="columns"
    :rows="nodesUi"
    rowKey="id"
    :headerButtons="headerButtons"
    @header-action="handleHeaderAction"
  >
    <!-- name はリンク化（その他は汎用列：slot未定義でそのまま表示） -->
    <template #cell-name="{ row }">
      <NuxtLink :to="`/physical-node/${row.id}`">
        {{ row.name }} <span v-if="row.isMgmt">（管理ノード）</span>
      </NuxtLink>
    </template>

    <!-- 行メニュー（この文字スタイルは維持） -->
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
    :show="actions.activeModal === 'delete-physical-nodes'"
    :message="`本当に '${actions.targetForDeletion?.name}' を削除しますか？`"
    :is-loading="actions.isDeleting"
    @close="actions.cancelAction"
    @confirm="actions.handleDelete"
  />
  <MoAddNodeToCluster
    :show="actions.activeModal === 'create-physical-nodes'"
    :nodes="candidateNodes"
    @close="actions.closeModal"
    @submit="handleCreateFromCandidate"
  />
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import MoDeleteConfirm from "@/components/MoDeleteConfirm.vue";
import MoAddNodeToCluster from "@/components/MoAddNodeToCluster.vue";
import { useToast } from "@/composables/useToast";

/* =========================
 * 型定義（Composition APIの型安全性）
 * ========================= */
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
  /** 表示用に整形済み（列側のキー名ハードコーディング回避） */
  createdAtText: string;
};

type CandidateDTO = { id: string; name: string; ipAddress: string };

type TableColumn = {
  key: keyof UiNode | string;
  label: string;
  /** 幅（px / % / auto） */
  width?: number | string;
  /** 最大幅（px / %） */
  maxWidth?: number | string;
  align?: "left" | "center" | "right";
};

/** useResourceList 戻り値の型（簡易） */
type UseResourceListReturn<T> = {
  data: Ref<T[] | null | undefined>;
  refresh: () => Promise<void>;
};

/** usePageActions 戻り値の型を明示（IDE補完向上） */
type UsePageActionsReturn<Row> = {
  activeModal: string | null;
  openModal: (name: string) => void;
  closeModal: () => void;
  targetForDeletion: Row | null;
  isDeleting: boolean;
  handleRowAction: (p: { action: string; row: Row }) => void;
  handleDelete: () => Promise<void>;
  handleSuccess: () => void;
  cancelAction: () => void;
};

const { addToast } = useToast();

/* =========================
 * APIエンドポイント
 * ========================= */
const API = {
  base: "/api/physical-nodes",
  candidates: "/api/physical-nodes/candidates",
  setAdmin: (id: string) =>
    `/api/physical-nodes/${encodeURIComponent(id)}/set-admin`,
  unsetAdmin: (id: string) =>
    `/api/physical-nodes/${encodeURIComponent(id)}/unset-admin`,
} as const;

/* =========================
 * データ取得 / ページアクション
 * ========================= */
const { data: nodesRaw, refresh } = useResourceList<PhysicalNodeDTO>(
  "physical-nodes"
) as UseResourceListReturn<PhysicalNodeDTO>;

const actions = usePageActions<UiNode>({
  resourceName: "physical-nodes",
  resourceLabel: "物理ノード",
  refresh,
}) as UsePageActionsReturn<UiNode>;

/* =========================
 * 列設定（width / maxWidth を汎用プロパティ化）
 * createdAt のような生キーを直接参照せず、整形済み createdAtText を表示
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

const headerButtons = ref([{ label: "ノード追加", action: "create" }] as const);

/* =========================
 * 整形ユーティリティ（index内で完結）
 * ========================= */
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

/** allSettled のエラー詳細抽出（トースト/ログに載せる） */
function extractErrorMessages(
  results: PromiseSettledResult<unknown>[]
): string[] {
  return results
    .filter((r): r is PromiseRejectedResult => r.status === "rejected")
    .map((r) => {
      const reason = (r as PromiseRejectedResult).reason;
      if (reason instanceof Error) return reason.message;
      try {
        return typeof reason === "string" ? reason : JSON.stringify(reason);
      } catch {
        return String(reason);
      }
    });
}

/* =========================
 * UIノード（createdAt → createdAtText に変換）
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

/* =========================
 * 管理ノード切替（解除は並列・詳細な失敗理由を提示）
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
      currentAdminIds.map((id) => $fetch(API.unsetAdmin(id), { method: "PUT" }))
    );

    const failedMessages = extractErrorMessages(unsetResults);
    if (failedMessages.length > 0) {
      console.error("管理ノード解除エラー詳細:", failedMessages);
      addToast({
        type: "warning",
        message: `一部の既存管理ノード解除に失敗（${failedMessages.length}件）。続行します。`,
        // 最多3件まで詳細を表示（長すぎ防止）
        details: failedMessages.slice(0, 3).join(" | "),
      });
    }

    await $fetch(API.setAdmin(targetId), { method: "PUT" });

    await refresh();
    actions.handleSuccess();
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

/* =========================
 * 削除（管理ノードは不可）
 * ========================= */
function handleDeleteRowClick(row: UiNode): void {
  if (row.isMgmt) return;
  actions.handleRowAction({ action: "delete", row });
}

/* =========================
 * 追加（候補取得 → モーダル）
 * ========================= */
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
  actions.openModal("create-physical-nodes");
}

async function handleCreateFromCandidate(c: CandidateDTO): Promise<void> {
  try {
    await $fetch(API.base, {
      method: "POST",
      body: { name: c.name, ipAddress: c.ipAddress },
    });
    await refresh();
    actions.handleSuccess();
    actions.closeModal();
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
