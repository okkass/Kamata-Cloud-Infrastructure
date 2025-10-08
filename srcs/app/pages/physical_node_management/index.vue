<template>
  <DashboardLayout
    title="物理ノードダッシュボード"
    :columns="columns"
    :rows="nodesUi"
    rowKey="id"
    :headerButtons="headerButtons"
    @header-action="onHeaderAction"
  >
    <!-- ノード名（詳細へ） -->
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

    <!-- 行メニュー（文字スタイルは維持） -->
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
          row.isMgmt || settingMgmtId === row.id
            ? 'text-slate-400 cursor-not-allowed'
            : 'text-slate-900 hover:bg-[#f5f7fa]'
        "
        :disabled="row.isMgmt || settingMgmtId === row.id"
        @click.stop.prevent="switchToAdmin(row)"
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
    isMgmt: !!n.isAdmin,
    createdAt: n.createdAt,
  }))
);

/* 管理ノード切替（解除は並列） */
const settingMgmtId = ref<string | null>(null);

async function switchToAdmin(row: UiNode) {
  if (row.isMgmt || settingMgmtId.value === row.id) return;
  settingMgmtId.value = row.id;

  const targetId = row.id;
  const currentAdmins = (nodesRaw.value ?? [])
    .filter((n) => n.isAdmin && n.id !== targetId)
    .map((n) => n.id);

  try {
    // 既存管理ノードを並列でOFF
    await Promise.all(
      currentAdmins.map(
        (id) =>
          $fetch(`/api/physical-nodes/${encodeURIComponent(id)}/unset-admin`, {
            method: "PUT",
          }).catch(() => {}) // 個別失敗は握りつぶし（サーバ排他に任せる）
      )
    );

    // 対象をON
    await $fetch(
      `/api/physical-nodes/${encodeURIComponent(targetId)}/set-admin`,
      { method: "PUT" }
    );

    await refresh();
    handleSuccess();
  } finally {
    settingMgmtId.value = null;
  }
}

/* 削除（管理ノードは不可） */
function onDelete(row: UiNode) {
  if (row.isMgmt) return;
  baseHandleRowAction({ action: "delete", row });
}

/* 追加 */
const candidateNodes = ref<CandidateDTO[]>([]);
const onHeaderAction = async (a: string) => {
  if (a !== "create") return;
  try {
    candidateNodes.value = await $fetch<CandidateDTO[]>(
      "/api/physical-nodes/candidates"
    );
  } catch {
    candidateNodes.value = [];
  }
  openModal("create-physical-nodes");
};
async function handleCreateFromCandidate(c: CandidateDTO) {
  await $fetch("/api/physical-nodes", {
    method: "POST",
    body: { name: c.name, ipAddress: c.ipAddress },
  });
  await refresh();
  handleSuccess();
  closeModal();
}

/* util（日付: isNaN(d.getTime()) で判定） */
const fmt = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(
    d.getHours()
  )}:${p(d.getMinutes())}`;
};
</script>
