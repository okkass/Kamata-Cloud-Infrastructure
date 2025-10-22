/**
 * =================================================================================
 * 仮想マシンイメージ管理ページ Composable (useImageManagement.ts)
 * ---------------------------------------------------------------------------------
 * UI に特化した状態・API連携・イベントハンドラを提供します。
 * =================================================================================
 */
import { ref, computed } from "vue";
import { useToast } from "@/composables/useToast";
import { useResourceList } from "@/composables/useResourceList";
import { usePageActions } from "@/composables/usePageActions";

type TableColumn = {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
};
type ImageDto = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  size: number;
};
type UiImage = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  size: string;
};

/** バイト数を読みやすく変換 */
const toSize = (b: number) => {
  if (!Number.isFinite(b)) return "—";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  let v = b;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v >= 10 || Number.isInteger(v) ? v.toFixed(0) : v.toFixed(1)}${
    units[i]
  }`;
};

export function useImageManagement() {
  const { addToast } = useToast();
  const { data: rawImages, refresh: refreshImageList } =
    useResourceList<ImageDto>("images");
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
  } = usePageActions<UiImage>({
    resourceName: "images",
    resourceLabel: "イメージ",
    refresh: refreshImageList,
  });

  const columns = ref<TableColumn[]>([
    { key: "name", label: "イメージ名", align: "left" },
    { key: "size", label: "サイズ", align: "right" },
    { key: "createdAt", label: "登録日", align: "left" },
  ]);
  const headerButtons = ref([{ label: "イメージ追加", action: "add-image" }]);

  const displayImages = computed<UiImage[]>(() =>
    (rawImages.value ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      createdAt: formatDateTime?.(r.createdAt) ?? r.createdAt,
      size: toSize(r.size),
    }))
  );

  function promptForImageDeletion(row: UiImage) {
    handleRowAction({ action: "delete", row });
  }

  function handleDashboardHeaderAction(action: string) {
    if (action !== "add-image") return;
    openModal("add-image");
  }

  // 簡易な成功トースト（必要なら usePageActions 側で処理しているため二重通知に注意）
  async function handleSuccessWrapper() {
    addToast?.({ type: "success", message: "追加しました。" });
    await handleSuccess();
  }

  return {
    columns,
    displayImages,
    headerButtons,
    activeModal,
    targetForDeletion,
    isDeleting,
    // ページ固有の UI 状態
    deletingImageId: ref<string | null>(null),
    // ハンドラ
    handleDashboardHeaderAction,
    promptForImageDeletion,
    cancelAction,
    handleDelete,
    closeModal,
    handleSuccess: handleSuccessWrapper,
  } as const;
}
