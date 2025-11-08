/**
 * =================================================================================
 * インスタンスタイプ管理ページ データ Composable (useInstanceTypeManagement.ts)
 * ---------------------------------------------------------------------------------
 * 責務:
 * 1. /api/instance-types からインスタンスタイプの一覧を取得する。
 * 2. 取得した生データを、ダッシュボードのテーブル表示用に整形する。
 * 3. テーブルのカラム定義やヘッダーボタンの定義をエクスポートする。
 * =================================================================================
 */
import { useResourceList } from "@/composables/useResourceList";

/* =========================== Main Composable =========================== */

export function useInstanceTypeManagement() {
  /**
   * ==================================================================
   * API Data Fetching (APIデータ取得)
   * ==================================================================
   */
  const {
    data: rawList,
    pending,
    refresh,
    error,
  } = useResourceList<ModelInstanceTypeDTO>("instance-types");

  /**
   * ==================================================================
   * UI Configuration (UI定義)
   * ==================================================================
   */
  const columns: TableColumn[] = [
    { key: "name", label: "名前", align: "left" },
    { key: "vcpu", label: "vCPU", align: "right" },
    { key: "memorySize", label: "メモリ (MB)", align: "right" },
    { key: "createdAtText", label: "作成日時", align: "left" },
  ];

  const headerButtons = [
    {
      action: "add", // usePageActions が 'add-instance-type' より 'add' を期待
      label: "インスタンスタイプ追加",
    },
  ];


  /**
   * ==================================================================
   * Expose (外部への公開)
   * ------------------------------------------------------------------
   * ページコンポーネントが必要とする、データ関連のものだけを返す。
   * ==================================================================
   */
  return {
    columns,
    headerButtons,
    rawList,
    pending,
    refresh,
    error,
  };
}
