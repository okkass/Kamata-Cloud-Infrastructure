<template>
  <DashboardLayout
    title="物理ノードダッシュボード"
    :columns="columns"
    :rows="nodesUi"
    rowKey="id"
    :headerButtons="headerButtons"
    :rowActions="rowActions"
    @header-action="onHeaderAction"
    @row-action="onRowAction"
  >
    <template #cell-name="{ row }">
      <NuxtLink
        :to="`/physical-node/${row.id}`"
        class="text-sky-600 hover:text-sky-800 hover:underline font-semibold"
      >
        {{ row.name }}
      </NuxtLink>
    </template>

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
  </DashboardLayout>

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
const rowActions = [
  { label: "詳細", action: "detail" },
  { label: "管理ノードに設定", action: "set-mgmt" },
  { label: "削除", action: "delete" },
];

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

const candidateNodes = ref<CandidateDTO[]>([]);
const loadCandidates = async () => {
  try {
    candidateNodes.value = await $fetch("/api/physical-nodes/candidates");
  } catch {
    candidateNodes.value = [];
  }
};
const onHeaderAction = async (a: string) => {
  if (a === "create") {
    await loadCandidates();
    openModal("create-physical-nodes");
  }
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

const onRowAction = async ({
  action,
  row,
}: {
  action: string;
  row: UiNode;
}) => {
  if (action === "detail") return navigateTo(`/physical-node/${row.id}`);
  if (action === "set-mgmt") {
    if (row.isMgmt) return;
    await $fetch(`/api/physical-nodes/${row.id}/set-admin`, { method: "PUT" });
    await refresh();
    handleSuccess();
    return;
  }
  baseHandleRowAction({ action, row });
};

const fmt = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d as any)) return iso;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(
    d.getHours()
  )}:${p(d.getMinutes())}`;
};
</script>

<style scoped>
:deep(th:last-child),
:deep(td:last-child) {
  width: 6.5rem;
  max-width: 6.5rem;
  text-align: right;
  padding-right: 0.75rem;
  white-space: nowrap;
}
:deep(td:last-child button),
:deep(td:last-child a[role="button"]),
:deep(td:last-child .btn),
:deep(td:last-child .dropdown-trigger),
:deep(td:last-child .row-actions-trigger) {
  min-width: 0 !important;
  width: auto !important;
  padding: 0.375rem 0.625rem !important;
  border-radius: 0.5rem !important;
  line-height: 1.5 !important;
}
:deep(td:last-child > div) {
  max-width: 100%;
}
:deep(td:last-child .dropdown-menu),
:deep(td:last-child .menu),
:deep(td:last-child .row-actions-menu) {
  right: 0;
  left: auto;
}
</style>
