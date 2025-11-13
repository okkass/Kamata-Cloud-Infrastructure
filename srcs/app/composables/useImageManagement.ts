/**
 * 仮想マシンイメージ管理ページ Composable
 */
import { ref, computed } from "vue";
import { useResourceList } from "@/composables/useResourceList";

/** 定数定義  */
export const addImageAction = `add-${IMAGE.name}`;
export const editImageAction = `edit-${IMAGE.name}`;
export const deleteImageAction = `delete-${IMAGE.name}`;

/**
 * テーブルUI用仮想マシンイメージオブジェクト
 */
export interface UiImage {
  /**
   * 仮想マシンイメージを識別するための一意なID
   */
  id: string;
  /**
   * 仮想マシンイメージの名前
   */
  name: string;
  /**
   * 仮想マシンイメージの説明
   */
  description?: string;
  /**
   * 仮想マシンイメージが作成された日時
   */
  createdAt: string;
  /**
   * 仮想マシンイメージのサイズ
   */
  size: string;
}

/**
 * 仮想マシンイメージ管理ページのUIロジックと状態を管理するComposable
 *
 * @returns {object} - Vueコンポーネントで利用するプロパティとメソッド
 */
export function useImageManagement() {
  // --- APIデータ取得 ---
  const { data: imageDTOs, refresh: refreshImageList } =
    useResourceList<ImageDTO>(IMAGE.name);

  // --- UI表示用の設定 ---
  const columns: TableColumn[] = [
    { key: "name", label: "イメージ名", align: "left" },
    { key: "size", label: "サイズ", align: "right" },
    { key: "createdAt", label: "登録日", align: "left" },
  ];
  const headerButtons = [{ label: "イメージ追加", action: "add" }];

  // --- データの整形 ---
  const images = computed<UiImage[]>(() =>
    (imageDTOs.value ?? []).map((dto) => ({
      id: dto.id,
      name: dto.name,
      description: dto.description,
      createdAt: formatDateTime(dto.createdAt),
      size: toSize(dto.size),
    }))
  );

  return {
    columns,
    images,
    headerButtons,
    refreshImageList,
  };
}
