/**
 * 仮想マシンイメージ管理ページ Composable
 */
import { computed, onMounted, onUnmounted } from "vue";
import { useResourceList } from "@/composables/useResourceList";
import { createPolling } from "@/utils/polling";
import type { ImageResponse } from "~~/shared/types";

/** 定数定義  */
export const addImageAction = `add-image`;
export const editImageAction = `edit-image`;
export const deleteImageAction = `delete-image`;

/**
 * 仮想マシンイメージ管理ページのUIロジックと状態を管理するComposable
 *
 * @returns {object} - Vueコンポーネントで利用するプロパティとメソッド
 */
export function useImageManagement() {
  // --- APIデータ取得 ---
  const {
    data: rawList,
    pending,
    refresh,
    error,
  } = useResourceList<ImageResponse>("images");

  // --- ポーリング設定 ---
  const { startPolling, stopPolling, runOnce, lastUpdatedTime } = createPolling(
    async () => {
      await refresh();
    }
  );

  // マウント時に即時実行し、その後ポーリング開始。アンマウント時に停止。
  onMounted(() => {
    void runOnce();
    startPolling();
  });

  onUnmounted(() => {
    stopPolling();
  });

  // --- UI表示用の設定 ---
  const columns = [
    { key: "name", label: "イメージ名", align: "left" as const },
    { key: "size", label: "サイズ", align: "right" as const },
    { key: "createdAt", label: "登録日", align: "left" as const },
  ];
  const headerButtons = [{ action: "add", label: "イメージ追加" }];

  // --- データの整形 ---
  const images = computed(() =>
    (rawList.value ?? []).map((image) => ({
      ...image,
      createdAt: formatDateTime(image.createdAt),
      size: toSize(image.size),
    }))
  );

  return {
    pending,
    error,
    columns,
    images,
    headerButtons,
    refresh,
    lastUpdatedTime,
    startPolling,
    stopPolling,
    ADD_IMAGE_ACTION: addImageAction,
    EDIT_IMAGE_ACTION: editImageAction,
    DELETE_IMAGE_ACTION: deleteImageAction,
  } as const;
}
