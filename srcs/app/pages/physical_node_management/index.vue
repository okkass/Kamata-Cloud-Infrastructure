<template>
  <DashboardLayout
    title="物理ノードダッシュボード"
    :columns="columns"
    :rows="nodesUi"
    rowKey="id"
    :headerButtons="headerButtons"
    @header-action="handleHeaderAction"
  >
    <!-- name はリンク化（その他は汎用列：slot未定義） -->
    <template #cell-name="{ row }">
      <NuxtLink :to="`/physical-node/${row.id}`">
        {{ row.name }} <span v-if="row.isMgmt">（管理ノード）</span>
      </NuxtLink>
    </template>

    <!-- 管理ノードは「削除不可」バッジ、他は通常メニュー -->
    <template #row-actions="{ row, emit }">
      <template v-if="row.isMgmt">
        <div class="action-item-disabled">削除不可</div>
      </template>
      <template v-else>
        <a href="#" class="action-item" @click.prevent="emit('delete')">
          削除
        </a>
        <a href="#" class="action-item" @click.prevent="emit('set-mgmt')">
          管理ノードに設定
        </a>
      </template>
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
import { ref, computed } from "vue";
import MoDeleteConfirm from "@/components/MoDeleteConfirm.vue";
import MoAddNodeToCluster from "@/components/MoAddNodeToCluster.vue";
import { useToast } from "@/composables/useToast";

/* =========================
 * 型定義（Composition API型安全）
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
  /** 表示用に整形済み（列側で特定キーをハードコーディングしない） */
  createdAtText: string;
};

type CandidateDTO = { id: string; name: string; ipAddress: string };

type TableColumn = {
  key: keyof UiNode | string;
  label: string;
  /** 固定幅 or 比率（%）or auto */
  width?: number | string;
  /** レイアウト崩れ防止の最大幅 */
  maxWidth?: number | string;
  align?: "left" | "center" | "right";
};

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
const { data: nodesRaw, refresh } =
  useResourceList<PhysicalNodeDTO>("physical-nodes");

const {
  activeModal,
  openModal,
  closeModal,
  targetForDeletion,
  isDeleting,
  handleRowAction: baseHandleRowAction,
  handleDelete,
  handleSuccess,
  cancelAction,
} = usePageActions<UiNode>({
  resourceName: "physical-nodes",
  resourceLabel: "物理ノード",
  refresh,
});

const { addToast } = useToast();

/* =========================
 * 列設定（width / maxWidth を汎用プロパティ化）
 * ========================= */
const columns = ref<TableColumn[]>([
  { key: "name", label: "ノード名", width: 260, maxWidth: 360 },
  { key: "ip", label: "IPアドレス", width: 180, maxWidth: 220 },
  { key: "status", label: "状態", width: 120, align: "center" },
  { key: "cpu", label: "CPU", width: 120, align: "right" },
  { key: "mem", label: "メモリ", width: 120, align: "right" },
  { key: "storage", label: "ストレージ", width: 140, align: "right" },
  // 特定キー createdAt を直接使わず、整形済みキー createdAtText を参照
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

/* =========================
 * UIノード（createdAt は createdAtText に変換）
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
 * 管理ノード切替（解除は並列）
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
    const failedUnsets = unsetResults.filter((r) => r.status === "rejected");
    if (failedUnsets.length > 0) {
      console.error("管理ノード解除に失敗:", failedUnsets);
      addToast({
        type: "warning",
        message: `一部の既存管理ノード解除に失敗しました（${failedUnsets.length}件）。続行します。`,
      });
    }

    await $fetch(API.setAdmin(targetId), { method: "PUT" });

    await refresh();
    handleSuccess();
    addToast({ type: "success", message: "管理ノードを切り替えました。" });
  } catch (e: unknown) {
    console.error("管理ノード切替エラー:", e);
    const msg = e instanceof Error ? e.message : String(e);
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
  baseHandleRowAction({ action: "delete", row });
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
    console.error("候補ノード取得エラー:", e);
    candidateNodes.value = [];
    addToast({ type: "error", message: "候補ノードの取得に失敗しました。" });
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
    console.error("ノード追加エラー:", e);
    const msg = e instanceof Error ? e.message : String(e);
    addToast({
      type: "error",
      message: "ノードの追加に失敗しました。",
      details: msg,
    });
  }
}
</script>
