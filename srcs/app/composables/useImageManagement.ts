/**
 * 仮想マシンイメージ管理ページ Composable
 */
import { ref, computed } from "vue";
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

const toSize = (b: number) => {
  if (!Number.isFinite(b)) return "—";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0,
    v = b;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v >= 10 || Number.isInteger(v) ? v.toFixed(0) : v.toFixed(1)}${
    units[i]
  }`;
};

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day} ${hh}:${mm}`;
};

export function useImageManagement() {
  const { data: rawImages, refresh: refreshImageList } =
    useResourceList<ImageDto>("images");
  const {
    activeModal,
    openModal,
    closeModal,
    targetForDeletion,
    isDeleting,
    handleRowAction,
    handleDelete: handleDeleteAction,
    handleSuccess: handleSuccessAction,
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
      createdAt: formatDateTime(r.createdAt),
      size: toSize(r.size),
    }))
  );

  const deletingImageId = ref<string | null>(null);

  function promptForImageDeletion(row: UiImage) {
    handleRowAction({ action: "delete", row });
  }

  function handleDashboardHeaderAction(action: string) {
    if (action !== "add-image") return;
    openModal("add-image");
  }

  // usePageActions の handleDelete をラップして削除中の id を追跡する
  async function handleDelete() {
    const row = targetForDeletion.value;
    if (!row) return;
    deletingImageId.value = row.id;
    try {
      await handleDeleteAction();
    } finally {
      deletingImageId.value = null;
    }
  }

  // handleSuccess をそのまま呼ぶ（通知は usePageActions 側で統一する想定）
  async function handleSuccess() {
    await handleSuccessAction();
  }

  return {
    columns,
    displayImages,
    headerButtons,
    activeModal,
    targetForDeletion,
    isDeleting,
    deletingImageId,
    handleDashboardHeaderAction,
    promptForImageDeletion,
    cancelAction,
    handleDelete,
    closeModal,
    handleSuccess,
  } as const;
}
