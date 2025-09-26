import { ref } from "vue";

/**
 * 汎用的なCRUDダッシュボードのUIアクションを管理するComposable
 * @param options - ダッシュボードの設定オプション
 */
export const useDashboardActions = <T extends { id: string; name: string }>(
  options: DashboardActionsOptions
) => {
  const { resourceName, resourceLabel, refresh } = options;

  // --- Composables ---
  const { activeModal, openModal, closeModal } = useModal();
  const { executeDelete, isDeleting } = useResourceDelete(resourceName);
  const { addToast } = useToast();

  // --- State ---
  const targetForDeletion = ref<T | null>(null);
  const targetForEditing = ref<T | null>(null);

  // --- Private Helper ---
  /** モーダルを閉じ、アクション対象のstateをリセットする */
  const resetActionTargets = () => {
    closeModal();
    targetForDeletion.value = null;
    targetForEditing.value = null;
  };

  // --- Event Handlers (Public) ---
  /** 行のアクションを処理する */
  const handleRowAction = ({ action, row }: { action: string; row: T }) => {
    if (action === "delete") {
      targetForDeletion.value = row;
      // ★ 修正点: 'delete' と resourceName の間にハイフンを追加
      openModal(`delete-${resourceName}`);
    }
    if (action === "edit") {
      targetForEditing.value = row;
      // ★ 修正点: 'edit' と resourceName の間にハイフンを追加
      openModal(`edit-${resourceName}`);
    }
  };

  /** 削除処理を実行する */
  const handleDelete = async () => {
    if (!targetForDeletion.value) return;
    const result = await executeDelete(targetForDeletion.value.id);

    if (result.success) {
      addToast({
        message: `'${targetForDeletion.value.name}' を削除しました。`,
        type: "success",
      });
      await refresh();
    } else {
      addToast({
        message: `'${targetForDeletion.value.name}' の削除に失敗しました。`,
        type: "error",
        details: result.error?.message,
      });
    }
    resetActionTargets();
  };

  /** 作成モーダルの成功を処理する */
  const handleCreateSuccess = async () => {
    addToast({
      message: `${resourceLabel}の作成に成功しました。`,
      type: "success",
    });
    resetActionTargets();
    await refresh();
  };

  /** 編集モーダルの成功を処理する */
  const handleEditSuccess = async () => {
    addToast({
      message: `${resourceLabel}の保存に成功しました。`,
      type: "success",
    });
    resetActionTargets();
    await refresh();
  };

  /** キャンセル処理（編集・削除モーダルで共通利用） */
  const cancelAction = () => {
    resetActionTargets();
  };

  return {
    // State
    activeModal,
    openModal,
    closeModal,
    targetForDeletion,
    targetForEditing,
    isDeleting,
    // Handlers
    handleRowAction,
    handleDelete,
    handleCreateSuccess,
    handleEditSuccess,
    cancelAction,
  };
};
