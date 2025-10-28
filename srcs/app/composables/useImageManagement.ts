/**
 * 仮想マシンイメージ管理ページ Composable
 */
import { ref, computed } from "vue";
import { useResourceList } from "@/composables/useResourceList";
import { usePageActions } from "@/composables/usePageActions";

interface UiImage {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  size: string;
};

/**
 * 仮想マシンイメージ管理ページのUIロジックと状態を管理するComposable
 *
 * @returns {object} - Vueコンポーネントで利用するプロパティとメソッド
 */
export function useImageManagement() {
  // --- 状態管理 (State Management) ---

  // useResourceList: APIから取得した生のDTOリストを管理
  const { data: imageDTOs, refresh: refreshImageList } =
    useResourceList<ImageDTO>("images");

  // usePageActions: モーダル表示、削除確認などの共通UIアクションを管理
  const {
    activeModal,
    openModal,
    closeModal,
    targetForDeletion,
    isDeleting,
    handleRowAction,
    handleDelete: executeDelete, // 元の関数を別名で受け取る
    handleSuccess: notifySuccess, // 元の関数を別名で受け取る
    cancelAction,
  } = usePageActions<UiImage>({
    resourceName: "images",
    resourceLabel: "イメージ",
    refresh: refreshImageList,
  });

  /** 削除処理中のイメージID。対象行のボタンを無効化するために使用 */
  const deletingImageId = ref<string | null>(null);

  // --- UIデータ定義 (UI Definitions) ---

  /** テーブルのカラム定義 */
  const columns = ref<TableColumn[]>([
    { key: "name", label: "イメージ名", align: "left" },
    { key: "size", label: "サイズ", align: "right" },
    { key: "createdAt", label: "登録日", align: "left" },
  ]);

  /** ダッシュボードヘッダーのボタン定義 */
  const headerButtons = ref([{ label: "イメージ追加", action: "add-image" }]);

  /**
   * 画面表示用にフォーマットされたイメージのリスト
   * APIから取得したDTOをUIに適した形式 (UiImage) に変換する
   */
  const images = computed<UiImage[]>(() =>
    (imageDTOs.value ?? []).map((dto) => ({
      id: dto.id,
      name: dto.name,
      description: dto.description,
      createdAt: formatDateTime(dto.createdAt),
      size: toSize(dto.size),
    }))
  );

  // --- アクションハンドラ (Action Handlers) ---

  /**
   * ヘッダーのボタンがクリックされたときのアクションを処理
   * @param action - 実行するアクション名
   */
  function handleHeaderAction(action: string) {
    if (action === "add-image") {
      openModal("add-image");
    }
  }
  
  /**
   * イメージ削除の確認モーダルを表示する
   * @param image - 削除対象のイメージデータ
   */
  function promptForDeletion(image: UiImage) {
    handleRowAction({ action: "delete", row: image });
  }

  /**
   * 削除処理を実行する
   * usePageActionsの削除処理をラップし、UIの状態（deletingImageId）を管理する
   */
  async function handleDelete() {
    const imageToDelete = targetForDeletion.value;
    if (!imageToDelete) return;

    deletingImageId.value = imageToDelete.id;
    try {
      await executeDelete(); // 実際の削除処理を実行
    } finally {
      // 成功・失敗にかかわらず、ローディング状態を解除
      deletingImageId.value = null;
    }
  }

  return {
    // データ
    columns,
    images,
    headerButtons,

    // モーダルと状態
    activeModal,
    closeModal,
    targetForDeletion,
    isDeleting, // 削除処理中かどうかの全体的な状態
    deletingImageId, // どのイメージが削除処理中かの個別状態

    // アクション
    handleHeaderAction, // 'handleDashboardHeaderAction' から改名
    promptForDeletion, // 'promptForImageDeletion' から改名
    cancelAction,
    handleDelete,
    notifySuccess, // 'handleSuccess' から改名
  } as const;
}