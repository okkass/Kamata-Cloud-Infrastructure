/**
 * 汎用的なページUIアクションを管理するComposable。
 * 専門家Composable（useModal, useResourceDeleteなど）を束ねる「管理者」として機能する。
 *
 * @template T - 扱うリソースの型。idとnameプロパティを持つ必要がある。
 * @param {PageActionsOptions} options - ページごとの設定オプション
 */
export const usePageActions = <T extends { id: string; name: string }>(
  options: PageActionsOptions
) => {
  const { resourceName, refresh } = options;

  // --- Composables Setup (専門家チームの招集) ---
  const { activeModal, openModal, closeModal } = useModal();
  const { addToast } = useToast();
  // 削除は汎用モーダルから実行されるため、この管理者が担当する
  const { executeDelete, isDeleting } = useResourceDelete(resourceName);

  // --- State (管理者が把握すべき情報) ---
  const targetForDeletion = ref<T | null>(null);
  const targetForEditing = ref<T | null>(null);

  // --- Private Helpers (管理者内部の補助作業) ---
  /** モーダルを閉じ、アクション対象のstateをリセットする */
  const resetActionTargets = () => {
    closeModal();
    targetForDeletion.value = null;
    targetForEditing.value = null;
  };

  // --- Public Handlers (外部からの指示を受けて実行する作業) ---
  /**
   * 行のアクション（編集/削除）を処理し、適切なモーダルを開く
   * @param {object} payload - { action: string, row: T }
   */
  const handleRowAction = ({ action, row }: { action: string; row: T }) => {
    if (action === "delete") {
      targetForDeletion.value = row;
      openModal(`delete-${resourceName}`);
    }
    if (action === "edit") {
      targetForEditing.value = row;
      openModal(`edit-${resourceName}`);
    }
  };

  /**
   * 汎用削除モーダルからの確定報告を受け、削除処理と通知を行う
   */
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

  /**
   * 特化型モーダル(作成/編集)からの成功報告を受け、後処理（モーダルを閉じる、一覧を更新）を行う
   */
  const handleSuccess = async () => {
    resetActionTargets();
    await refresh();
  };

  /**
   * 編集・削除モーダルのキャンセル処理
   */
  const cancelAction = () => {
    resetActionTargets();
  };

  // --- Return (外部に公開する機能) ---
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
    handleSuccess,
    cancelAction,
  };
};
