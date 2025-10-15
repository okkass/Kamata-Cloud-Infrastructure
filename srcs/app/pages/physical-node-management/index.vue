<template>
  <!-- この表だけ横スクロール＆省略完全禁止 -->
  <div class="physical-nodes-table overflow-x-auto">
    <DashboardLayout
      title="物理ノードダッシュボード"
      :columns="columns"
      :rows="nodesUi"
      rowKey="id"
      :headerButtons="headerButtons"
      no-ellipsis
      @header-action="handleHeaderAction"
    >
      <!-- name はリンク（省略禁止） -->
      <template #cell-name="{ row }">
        <NuxtLink :to="`/physical-node/${row.id}`" class="no-ellipsis inline">
          {{ row.name }} <span v-if="row.isMgmt">（管理ノード）</span>
        </NuxtLink>
      </template>

      <!-- IPは必ず全表示 -->
      <template #cell-ip="{ row }">
        <span class="no-ellipsis font-mono">{{ row.ip }}</span>
      </template>

      <!-- 作成日時も必ず全表示 -->
      <template #cell-createdAtText="{ row }">
        <span class="no-ellipsis">{{ row.createdAtText }}</span>
      </template>

      <!-- 行メニュー -->
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
    @close="closeModal"
    @submit="handleCreateFromCandidate"
  />
</template>

<script setup lang="ts">
import { ref, computed, type Ref } from "vue";
import MoDeleteConfirm from "@/components/MoDeleteConfirm.vue";
import MoAddNodeToCluster from "@/components/MoAddNodeToCluster.vue";
import { useToast } from "@/composables/useToast";

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

const API_ENDPOINTS = {
  BASE: "/api/physical-nodes",
  SET_ADMIN: (id: string) =>
    `/api/physical-nodes/${encodeURIComponent(id)}/set-admin`,
  UNSET_ADMIN: (id: string) =>
    `/api/physical-nodes/${encodeURIComponent(id)}/unset-admin`,
} as const;

const DEFAULT_TOAST_DURATION_MS = 2200;
const { addToast } = useToast();

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

const columns = ref<TableColumn[]>([
  { key: "name", label: "ノード名", align: "left" },
  { key: "ip", label: "IPアドレス", align: "left" },
  { key: "status", label: "状態", align: "center" },
  { key: "cpu", label: "CPU", align: "right" },
  { key: "mem", label: "メモリ", align: "right" },
  { key: "storage", label: "ストレージ", align: "right" },
  { key: "createdAtText", label: "作成日時", align: "left" },
]);

const headerButtons = ref([{ label: "ノード追加", action: "create" }]);

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

const switchingId = ref<string | null>(null);
async function switchManagementNodeToTarget(targetId: string) {
  if (switchingId.value === targetId) return;
  const target = nodesUi.value.find((n) => n.id === targetId);
  if (!target || target.isMgmt) return;

  switchingId.value = targetId;
  try {
    const currentAdminIds = (nodesRaw.value ?? [])
      .filter((n) => n.isAdmin && n.id !== targetId)
      .map((n) => n.id);
    await Promise.allSettled(
      currentAdminIds.map((id) =>
        $fetch(API_ENDPOINTS.UNSET_ADMIN(id), { method: "PUT" })
      )
    );
    await $fetch(API_ENDPOINTS.SET_ADMIN(targetId), { method: "PUT" });
    await refresh();
    handleSuccess();
    addToast({
      type: "success",
      message: "管理ノードを切り替えました。",
      duration: DEFAULT_TOAST_DURATION_MS,
    });
  } catch (e: any) {
    addToast({
      type: "error",
      message: "管理ノードの切替に失敗しました。",
      details: e?.message ?? String(e),
      duration: DEFAULT_TOAST_DURATION_MS,
    });
  } finally {
    switchingId.value = null;
  }
}

function handleDeleteRowClick(row: UiNode) {
  if (row.isMgmt) return;
  handleRowAction({ action: "delete", row });
}
async function handleHeaderAction(action: string) {
  if (action !== "create") return;
  openModal("create-physical-nodes");
}
async function handleCreateFromCandidate(c: {
  id: string;
  name: string;
  ipAddress: string;
}) {
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
  } catch (e: any) {
    addToast({
      type: "error",
      message: "ノードの追加に失敗しました。",
      details: e?.message ?? String(e),
      duration: DEFAULT_TOAST_DURATION_MS,
    });
  }
}
</script>

<style scoped>
/* この表だけ横スクロール＆省略完全禁止 */
:deep(.physical-nodes-table table) {
  table-layout: auto !important;
  width: auto !important;
  min-width: max-content !important;
}
.no-ellipsis,
:deep(.physical-nodes-table th),
:deep(.physical-nodes-table td),
:deep(.physical-nodes-table th *),
:deep(.physical-nodes-table td *) {
  white-space: nowrap !important;
  overflow: visible !important;
  text-overflow: clip !important;
  max-width: none !important;
}
</style>
