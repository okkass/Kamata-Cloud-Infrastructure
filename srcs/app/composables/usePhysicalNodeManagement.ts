/**
 * =================================================================================
 * 物理ノード管理ページ Composable (usePhysicalNodeManagement.ts)
 * ---------------------------------------------------------------------------------
 * このComposableは、物理ノード管理ページで使用される状態管理、
 * API連携、イベントハンドラなどのロジックをすべてカプセル化します。
 * =================================================================================
 */
import { ref, computed } from "vue";
import { useToast } from "@/composables/useToast";
import { useResourceList } from "@/composables/useResourceList";
import { usePageActions } from "@/composables/usePageActions";

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

/**
 * メインのComposable関数
 */
export function usePhysicalNodeManagement() {
  // ============================================================================
  // Composables Setup
  // ============================================================================
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
    handleDelete,
    handleSuccess,
    cancelAction,
  } = usePageActions<DisplayNode>({
    resourceName: "physical-nodes",
    resourceLabel: "物理ノード",
    refresh: refreshNodeList,
  });

  // ============================================================================
  // Component State
  // ============================================================================
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

  // ============================================================================
  // Computed Properties
  // ============================================================================
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

  // ============================================================================
  // Helper Functions
  // ============================================================================
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

  // ============================================================================
  // Event Handlers
  // ============================================================================
  async function handleSetAsManagementNode(targetId: string) {
    if (switchingNodeId.value === targetId) return;

    switchingNodeId.value = targetId;
    try {
      const currentAdminNode = (rawNodes.value ?? []).find(
        (n) => n.isAdmin && n.id !== targetId
      );
      if (currentAdminNode) {
        await $fetch(`/api/physical-nodes/${currentAdminNode.id}`, {
          method: "PUT",
          body: { isAdmin: false },
        });
      }
      await $fetch(`/api/physical-nodes/${targetId}`, {
        method: "PUT",
        body: { isAdmin: true },
      });

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

  // ============================================================================
  // Expose
  // コンポーネント側で利用する変数や関数を返却
  // ============================================================================
  return {
    // Table Data
    columns,
    displayNodes,
    headerButtons,
    // Modals & Actions
    activeModal,
    targetForDeletion,
    isDeleting,
    switchingNodeId,
    // Handlers
    handleDashboardHeaderAction,
    handleSetAsManagementNode,
    promptForNodeDeletion,
    cancelAction,
    handleDelete,
    closeModal,
    handleSuccess,
  };
}
