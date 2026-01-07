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
import { computed, onMounted, onUnmounted } from "vue";
import { useResourceList } from "@/composables/useResourceList";
import type { InstanceTypeResponse } from "~~/shared/types";

/** 定数定義  */
export type InstanceTypeRow = {
  id: string;
  name: string;
  vcpu: number;
  memorySize: number;
  createdAtText: string;
  originalData?: InstanceTypeResponse;
};

const RESOURCE_NAME = INSTANCE_TYPE.name;
export const ADD_INSTANCE_TYPE_ACTION = `add-${RESOURCE_NAME}`;
export const EDIT_INSTANCE_TYPE_ACTION = `edit-${RESOURCE_NAME}`;
export const DELETE_INSTANCE_TYPE_ACTION = `delete-${RESOURCE_NAME}`;

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
  } = useResourceList<InstanceTypeResponse>(RESOURCE_NAME);

  const { startPolling, stopPolling, runOnce, lastUpdatedTime } = createPolling(
    async () => {
      await refresh();
    }
  );

  // マウント時に即座に初回データを取得し、その後定期ポーリング開始。

  onMounted(() => {
    void runOnce();
    startPolling();
  });

  onUnmounted(() => {
    stopPolling();
  });

  /**
   * ==================================================================
   * UI Configuration (UI定義)
   * ==================================================================
   */
  const columns = [
    { key: "name", label: "名前", align: "left" as const },
    { key: "vcpu", label: "vCPU", align: "right" as const },
    { key: "memorySize", label: "メモリ (MB)", align: "right" as const },
    { key: "createdAtText", label: "作成日時", align: "left" as const },
  ];

  const headerButtons = [{ action: "add", label: "追加" }];

  const rows = computed(() =>
    (rawList.value ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      vcpu: r.cpuCore,
      memorySize: convertByteToUnit(r.memorySize, "MB"),
      createdAtText: formatDateTime(r.createdAt),
      originalData: r,
    }))
  );

  /**
   * ==================================================================
   * Expose (外部への公開)
   * ------------------------------------------------------------------
   * ページコンポーネントが必要とする、データ関連のものだけを返す。
   * ==================================================================
   */
  return {
    pending,
    error,
    columns,
    headerButtons,
    rows,
    refresh,
    lastUpdatedTime,
    startPolling,
    stopPolling,
    ADD_INSTANCE_TYPE_ACTION,
    EDIT_INSTANCE_TYPE_ACTION,
    DELETE_INSTANCE_TYPE_ACTION,
  } as const;
}
