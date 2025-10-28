/**
 * 仮想マシンイメージ管理ページ Composable
 */
import { ref, computed } from "vue";
import { useResourceList } from "@/composables/useResourceList";

/**
 * 仮想マシンイメージ管理ページのUIロジックと状態を管理するComposable
 *
 * @returns {object} - Vueコンポーネントで利用するプロパティとメソッド
 */
export function useImageManagement() {
  // --- APIデータ取得 ---
  const { data: imageDTOs, refresh: refreshImageList } =
    useResourceList<ImageDTO>("images");

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
