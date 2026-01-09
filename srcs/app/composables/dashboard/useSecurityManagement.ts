/**
 * =================================================================================
 * セキュリティグループ ダッシュボード Composable
 * ---------------------------------------------------------------------------------
 * /api/security-groups の仕様に合わせて一覧を整形し、ページ用のハンドラを提供。
 * =================================================================================
 */
import { computed } from "vue";
import { useResourceList } from "@/composables/useResourceList";
import { useUserPermission } from "@/composables/useUserPermission";
import { SECURITY_GROUP } from "@/utils/constants";
import { formatDateTime } from "@/utils/date";
import type { SecurityGroupResponse } from "~~/shared/types";

/* =========================== Types (APIに準拠) =========================== */

/** テーブルUI用（明示的なフィールド名を追加） */
export interface UiEnhancedSecurityGroup extends SecurityGroupResponse {
  inboundRuleCount: number;
  outboundRuleCount: number;
  ruleSummary: string;
  rulesText: string;
  originalData?: SecurityGroupResponse;
  ownerName: string;
}

export const addSecurityGroupAction = `add-${SECURITY_GROUP.name}`;
export const editSecurityGroupAction = `edit-${SECURITY_GROUP.name}`;
export const deleteSecurityGroupAction = `delete-${SECURITY_GROUP.name}`;

/* =========================== Main Composable =========================== */
export function useSecurityDashboard() {
  // --- Permissions ---
  const { isAdmin, isSecurityGroupAdmin } = useUserPermission();

  // TODO: 本実装用のコード。テスト完了後に有効化する。
  // const isManager = computed(
  //   () => isAdmin.value === true || isSecurityGroupAdmin.value === true
  // );

  // TEST: テスト用に強制的にtrueにする
  const isManager = computed(() => true);

  // --- API Data ---
  const { data: rawGroups, refresh: refreshGroupList } =
    useResourceList<SecurityGroupResponse>(SECURITY_GROUP.name);

  const { data: rawAllGroups, refresh: refreshAllGroupList } =
    useResourceList<SecurityGroupResponse>(SECURITY_GROUP.name, {
      scope: computed(() => (isManager.value ? "all" : undefined)),
    });

  // --- UI Configuration ---
  const columns: TableColumn[] = [
    { key: "name", label: "グループ名", align: "left" },
    { key: "ownerName", label: "所有者", align: "left" },
    { key: "description", label: "説明", align: "left" },
    { key: "rulesText", label: "イン/アウト ルール数", align: "center" },
    { key: "createdAt", label: "作成日時", align: "left" },
  ];
  const headerButtons = [{ label: "セキュリティグループ追加", action: "add" }];

  const formatGroup = (g: SecurityGroupResponse): UiEnhancedSecurityGroup => {
    const inboundRuleCount: number =
      g.rules?.filter((r) => r.ruleType === "inbound").length ?? 0;
    const outboundRuleCount: number =
      g.rules?.filter((r) => r.ruleType === "outbound").length ?? 0;
    const summary: string = `${inboundRuleCount} / ${outboundRuleCount}`;

    return {
      ...g,
      inboundRuleCount,
      outboundRuleCount,
      ruleSummary: summary,
      rulesText: summary,
      ownerName: g.owner?.name ?? "",
      createdAt: formatDateTime(g.createdAt),
      originalData: g,
    };
  };

  const groups = computed<UiEnhancedSecurityGroup[]>(() =>
    (rawGroups.value ?? []).map(formatGroup)
  );

  const allGroups = computed<UiEnhancedSecurityGroup[]>(() => {
    if (!isManager.value) return [];
    return (rawAllGroups.value ?? []).map(formatGroup);
  });

  return {
    columns,
    groups,
    allGroups,
    isManager,
    headerButtons,
    refreshGroupList,
    refreshAllGroupList,
    ADD_SECURITY_GROUP_ACTION: addSecurityGroupAction,
    EDIT_SECURITY_GROUP_ACTION: editSecurityGroupAction,
    DELETE_SECURITY_GROUP_ACTION: deleteSecurityGroupAction,
  };
}
