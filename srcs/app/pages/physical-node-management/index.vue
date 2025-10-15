<template>
  <div>
    <DashboardLayout
      title="物理ノード管理"
      :columns="columns"
      :rows="displayNodes"
      rowKey="id"
      :headerButtons="headerButtons"
      @header-action="handleDashboardHeaderAction"
    >
      <template #cell-name="{ row }">
        <NuxtLink :to="`/physical-node/${row.id}`" class="table-link">
          {{ row.name }}
          <span v-if="row.isMgmt" class="text-sm text-gray-500"
            >（管理ノード）</span
          >
        </NuxtLink>
      </template>

      <template #cell-ip="{ row }">
        <span class="font-mono">{{ row.ip }}</span>
      </template>

      <template #row-actions="{ row }">
        <NuxtLink :to="`/physical-node/${row.id}`" class="action-item">
          詳細
        </NuxtLink>

        <button
          type="button"
          class="action-item"
          :class="{
            'action-item-disabled': row.isMgmt || switchingNodeId === row.id,
          }"
          :disabled="row.isMgmt || switchingNodeId === row.id"
          @click.stop.prevent="handleSetAsManagementNode(row.id)"
        >
          管理ノードに設定
        </button>

        <button
          type="button"
          class="action-item action-item-danger"
          :class="{ 'action-item-disabled': row.isMgmt }"
          :disabled="row.isMgmt"
          @click.stop.prevent="promptForNodeDeletion(row)"
        >
          削除
        </button>
      </template>
    </DashboardLayout>
  </div>

  <MoDeleteConfirm
    :show="activeModal === 'delete-physical-nodes'"
    :message="`本当にノード「${targetForDeletion?.name}」を削除しますか？`"
    :is-loading="isDeleting"
    @close="cancelAction"
    @confirm="handleDelete"
  />
  <MoAddNodeToCluster
    :show="activeModal === 'add-physical-node'"
    @close="closeModal"
    @success="handleSuccess"
  />
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * 物理ノード管理ページ
 * ---------------------------------------------------------------------------------
 * このページは、物理ノードの一覧表示、管理ノードの切り替え、
 * ノードの追加・削除といった機能を提供します。
 * UIの描画と、ユーザー操作に応じたComposableの関数呼び出しが主な責務です。
 * =================================================================================
 */
import { ref, computed } from "vue";
import { useToast } from "@/composables/useToast";

// ==============================================================================
// Type Definitions
// ==============================================================================
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
type DisplayNode = {
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
  key: keyof DisplayNode | string;
  label: string;
  align?: "left" | "center" | "right";
};

// ==============================================================================
// Composables Setup
// ==============================================================================
const { addToast } = useToast();
const { data: rawNodes, refresh: refreshNodeList } =
  useResourceList<PhysicalNodeDto>("physical-nodes");
const {
  activeModal,
  openModal,
  closeModal,
  targetForDeletion,
  isDeleting,
  handleRowAction,
  handleDelete, // ★ executeDelete から handleDelete に変更
  handleSuccess,
  cancelAction,
} = usePageActions<DisplayNode>({
  resourceName: "physical-nodes",
  resourceLabel: "物理ノード",
  refresh: refreshNodeList,
});

// ==============================================================================
// Component State
// ==============================================================================
const columns = ref<TableColumn[]>([
  { key: "name", label: "ノード名", align: "left" },
  { key: "ip", label: "IPアドレス", align: "left" },
  { key: "status", label: "状態", align: "center" },
  { key: "cpu", label: "CPU", align: "right" },
  { key: "mem", label: "メモリ", align: "right" },
  { key: "storage", label: "ストレージ", align: "right" },
  { key: "createdAtText", label: "作成日時", align: "left" },
]);
const headerButtons = ref([{ label: "ノード追加", action: "add" }]);
const switchingNodeId = ref<string | null>(null);

// ==============================================================================
// Computed Properties
// ==============================================================================
const displayNodes = computed<DisplayNode[]>(() =>
  (rawNodes.value ?? []).map((node) => ({
    id: node.id,
    name: node.name,
    ip: node.ipAddress,
    status: node.status === "active" ? "稼働中" : "停止中",
    cpu: formatAsPercent(node.cpuUtilization),
    mem: formatAsPercent(node.memoryUtilization),
    storage: formatAsPercent(node.storageUtilization),
    isMgmt: Boolean(node.isAdmin),
    createdAtText: formatDateTime(node.createdAt),
  }))
);

// ==============================================================================
// Helper Functions
// ==============================================================================
function formatAsPercent(value?: number): string {
  return typeof value === "number" && isFinite(value)
    ? `${Math.round(value * 100)}%`
    : "—";
}
function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}/${p(date.getMonth() + 1)}/${p(
    date.getDate()
  )} ${p(date.getHours())}:${p(date.getMinutes())}`;
}

// ==============================================================================
// Event Handlers
// ==============================================================================

/**
 * 「管理ノードに設定」ボタンがクリックされたときの処理
 * @param targetId - 新しく管理ノードにするノードのID
 */
async function handleSetAsManagementNode(targetId: string) {
  if (switchingNodeId.value === targetId) return;

  switchingNodeId.value = targetId;
  try {
    // 1. 現在の管理ノードを特定
    const currentAdminNode = (rawNodes.value ?? []).find(
      (n) => n.isAdmin && n.id !== targetId
    );

    // 2. 現在の管理ノードが存在すれば、管理ノードから解除するAPIを呼び出す
    if (currentAdminNode) {
      await $fetch(`/api/physical-nodes/${currentAdminNode.id}`, {
        method: "PUT",
        body: { isAdmin: false },
      });
    }

    // 3. ターゲットを新しい管理ノードに設定するAPIを呼び出す
    await $fetch(`/api/physical-nodes/${targetId}`, {
      method: "PUT",
      body: { isAdmin: true },
    });

    // 4. 成功後、一覧を更新して通知
    await refreshNodeList();
    addToast({ type: "success", message: "管理ノードを切り替えました。" });
  } catch (e: any) {
    addToast({
      type: "error",
      message: "管理ノードの切替に失敗しました。",
      details: e?.message ?? String(e),
    });
  } finally {
    switchingNodeId.value = null;
  }
}

function promptForNodeDeletion(row: DisplayNode) {
  if (row.isMgmt) return;
  handleRowAction({ action: "delete", row });
}

function handleDashboardHeaderAction(action: string) {
  if (action !== "add") return;
  openModal("add-physical-node");
}
</script>
