/**
 * 仮想マシンイメージ管理ページ Composable
 */
import { computed, onMounted, onUnmounted } from "vue";
import { useResourceList } from "@/composables/useResourceList";
import { createPolling } from "@/utils/polling";
import { IMAGE } from "@/utils/constants";
import type { ImageResponse } from "~~/shared/types";

/** 定数定義  */
const RESOURCE_NAME = IMAGE.name;
export const ADD_IMAGE_ACTION = `add-${RESOURCE_NAME}`;
export const EDIT_IMAGE_ACTION = `edit-${RESOURCE_NAME}`;
export const DELETE_IMAGE_ACTION = `delete-${RESOURCE_NAME}`;

/** 表示用の型定義 */
export type ImageRow = {
  id: string;
  name: string;
  createdAt: string; // 表示用フォーマット済み文字列
  size: string; // 表示用フォーマット済み文字列
  originalData: ImageResponse;
};

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
  } = useResourceList<ImageResponse>(RESOURCE_NAME);

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
  const columns: TableColumn[] = [
    { key: "name", label: "イメージ名", align: "left" as const },
    { key: "size", label: "サイズ", align: "right" as const },
    { key: "createdAt", label: "登録日", align: "left" as const },
  ];
  const headerButtons = [{ action: "add", label: "イメージ追加" }];

  // --- データの整形 ---
  const images = computed<ImageRow[]>(() =>
    (rawList.value ?? []).map((image) => ({
      id: image.id,
      name: image.name,
      createdAt: formatDateTime(image.createdAt),
      size: toSize(image.size),
      originalData: image,
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
    ADD_IMAGE_ACTION,
    EDIT_IMAGE_ACTION,
    DELETE_IMAGE_ACTION,
  } as const;
}
