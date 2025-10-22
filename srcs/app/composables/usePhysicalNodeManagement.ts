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


/**
 * メインのComposable関数
 */
export function usePhysicalNodeManagement() {
  // ============================================================================
  // Composables Setup
  // ============================================================================
  const { addToast } = useToast();
  const { data: rawNodes, refresh: refreshNodeList } =
    useResourceList<PhysicalNodeDTO>("physical-nodes");
  const { executeUpdate: updateNode } = useResourceUpdate<
    PhysicalNodeUpdateRequestDTO,
    PhysicalNodeDTO
  >("physical-nodes");
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
    { key: "createdAt", label: "作成日時", align: "left" },
  ]);
  const headerButtons = ref([{ label: "ノード追加", action: "add" }]);
  const switchingNodeId = ref<string | null>(null);

  // ============================================================================
  // Computed Properties
  // ============================================================================
  const displayNodes = computed<UiNode[]>(() =>
    (rawNodes.value ?? []).map((node) => ({
      id: node.id,
      name: node.name,
      ip: node.ipAddress,
      status: node.status,
      cpu: formatAsPercent(node.cpuUtilization),
      mem: formatAsPercent(node.memoryUtilization),
      storage: formatAsPercent(node.storageUtilization),
      isMgmt: Boolean(node.isAdmin),
      createdAt: formatDateTime(node.createdAt),
    }))
  );
  // ============================================================================
  // Event Handlers
  // ============================================================================
  /**
   * [ページ固有アクション] 指定されたノードを管理ノードとして設定します。
   * @param {string} targetId - 新しい管理ノードのID
   */
  async function handleSetAsManagementNode(targetId: string) {
    if (switchingNodeId.value) return; // 処理中の重複実行を防止
    switchingNodeId.value = targetId;

    try {
      const currentAdminNode = (rawNodes.value ?? []).find((n) => n.isAdmin);

      if (currentAdminNode && currentAdminNode.id !== targetId) {
        const unsetResult = await updateNode(currentAdminNode.id, {
          isAdmin: false,
        });

        // もし解除に失敗したら、エラー通知を出して処理を中断
        if (!unsetResult.success) {
          addToast({
            type: "error",
            message: "既存管理ノードの解除に失敗しました。",
            details: unsetResult.error?.message,
          });
          return;
        }
      }

      const setResult = await updateNode(targetId, { isAdmin: true });

      if (setResult.success) {
        addToast({ type: "success", message: "管理ノードを切り替えました。" });
        await refreshNodeList();
      } else {
        addToast({
          type: "error",
          message: "管理ノードの設定に失敗しました。",
          details: setResult.error?.message,
        });
      }
    } finally {
      switchingNodeId.value = null;
    }
  }
  function promptForNodeDeletion(row: UiNode) {
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
