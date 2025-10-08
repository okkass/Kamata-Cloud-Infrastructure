<template>
  <DashboardLayout
    title="物理ノードダッシュボード"
    :columns="columns"
    :rows="nodesUi"
    rowKey="id"
    :headerButtons="headerButtons"
    @header-action="onHeaderAction"
  >
    <template #cell-name="{ row }">
      <NuxtLink :to="`/physical-node/${row.id}`">
        {{ row.name }} <span v-if="row.isMgmt">（管理ノード）</span>
      </NuxtLink>
    </template>

    <!-- 素の表示 -->
    <template #cell-ip="{ row }"
      ><span>{{ row.ip }}</span></template
    >
    <template #cell-status="{ row }"
      ><span>{{ row.status }}</span></template
    >
    <template #cell-cpu="{ row }"
      ><span>{{ row.cpu }}</span></template
    >
    <template #cell-mem="{ row }"
      ><span>{{ row.mem }}</span></template
    >
    <template #cell-storage="{ row }"
      ><span>{{ row.storage }}</span></template
    >
    <template #cell-createdAt="{ row }"
      ><span>{{ fmt(row.createdAt) }}</span></template
    >

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
        @click.stop.prevent="switchToAdmin(row.id)"
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
        @click.stop.prevent="onDelete(row)"
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
import { ref, computed } from "vue";
import MoDeleteConfirm from "@/components/MoDeleteConfirm.vue";
import MoAddNodeToCluster from "@/components/MoAddNodeToCluster.vue";
import { useToast } from "@/composables/useToast";

/* ===== 型 ===== */
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
  createdAt: string;
};
type CandidateDTO = { id: string; name: string; ipAddress: string };

/* ===== 定数 ===== */
const API = {
  base: "/api/physical-nodes",
  candidates: "/api/physical-nodes/candidates",
  setAdmin: (id: string) =>
    `/api/physical-nodes/${encodeURIComponent(id)}/set-admin`,
  unsetAdmin: (id: string) =>
    `/api/physical-nodes/${encodeURIComponent(id)}/unset-admin`,
} as const;

/* ===== データ取得 / ページアクション ===== */
const { data: nodesRaw, refresh } =
  useResourceList<PhysicalNodeDTO>("physical-nodes"); // Wiki流:contentReference[oaicite:2]{index=2}
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
}); // Wiki流:contentReference[oaicite:3]{index=3}
const { addToast } = useToast();

/* ===== テーブル設定 ===== */
const columns = [
  { key: "name", label: "ノード名" },
  { key: "ip", label: "IPアドレス" },
  { key: "status", label: "状態" },
  { key: "cpu", label: "CPU" },
  { key: "mem", label: "メモリ" },
  { key: "storage", label: "ストレージ" },
  { key: "createdAt", label: "作成日時" },
];
const headerButtons = [{ label: "ノード追加", action: "create" }];

/* ===== 整形 ===== */
const pct = (v?: number) =>
  typeof v === "number" ? `${Math.round(v * 100)}%` : "—";
const nodesUi = computed<UiNode[]>(() =>
  (nodesRaw.value ?? []).map((n) => ({
    id: n.id,
    name: n.name,
    ip: n.ipAddress,
    status: n.status === "active" ? "稼働中" : "停止中",
    cpu: pct(n.cpuUtilization),
    mem: pct(n.memoryUtilization),
    storage: pct(n.storageUtilization),
    isMgmt: Boolean(n.isAdmin),
    createdAt: n.createdAt,
  }))
);

/* ===== 管理ノード切替（解除は並列、最後に必ず ON） ===== */
const switchingId = ref<string | null>(null);

async function switchToAdmin(targetId: string): Promise<void> {
  if (switchingId.value === targetId) return;
  const target = nodesUi.value.find((n) => n.id === targetId);
  if (!target || target.isMgmt) return;

  switchingId.value = targetId;
  try {
    // 既存の管理ノードを並列で解除
    const currentAdminIds = (nodesRaw.value ?? [])
      .filter((n) => n.isAdmin && n.id !== targetId)
      .map((n) => n.id);

    await Promise.allSettled(
      currentAdminIds.map((id) =>
        $fetch(API.unsetAdmin(id), { method: "PUT" }).catch(() => {})
      )
    );

    // 対象ノードを管理ノードに
    await $fetch(API.setAdmin(targetId), { method: "PUT" });

    await refresh();
    handleSuccess();
    addToast({ type: "success", message: "管理ノードを切り替えました。" });
  } catch (e: any) {
    addToast({
      type: "error",
      message: "管理ノードの切替に失敗しました。",
      details: e?.message,
    });
  } finally {
    switchingId.value = null;
  }
}

/* ===== 削除（管理ノードは不可） ===== */
function onDelete(row: UiNode): void {
  if (row.isMgmt) return;
  baseHandleRowAction({ action: "delete", row });
}

/* ===== 追加 ===== */
const candidateNodes = ref<CandidateDTO[]>([]);
async function onHeaderAction(action: string): Promise<void> {
  if (action !== "create") return;
  try {
    candidateNodes.value = await $fetch<CandidateDTO[]>(API.candidates);
  } catch {
    candidateNodes.value = [];
  }
  openModal("create-physical-nodes");
}
async function handleCreateFromCandidate(c: CandidateDTO): Promise<void> {
  await $fetch(API.base, {
    method: "POST",
    body: { name: c.name, ipAddress: c.ipAddress },
  });
  await refresh();
  handleSuccess();
  closeModal();
  addToast({ type: "success", message: `ノード '${c.name}' を追加しました。` });
}

/* ===== util（日付: isNaN(d.getTime()) で判定） ===== */
function fmt(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(
    d.getHours()
  )}:${p(d.getMinutes())}`;
}
</script>
