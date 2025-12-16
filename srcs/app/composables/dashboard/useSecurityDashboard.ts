/**
 * =================================================================================
 * セキュリティグループ ダッシュボード Composable
 * ---------------------------------------------------------------------------------
 * /api/security-groups の仕様に合わせて一覧を整形し、ページ用のハンドラを提供。
 * =================================================================================
 */
import { computed } from "vue";
import { useResourceList } from "@/composables/useResourceList";
import { SECURITY_GROUP } from "@/utils/constants";
import type { SecurityGroupResponse } from "~~/shared/types";

/* =========================== Types (APIに準拠) =========================== */

/** テーブルUI用（明示的なフィールド名を追加） */
interface UiEnhancedSecurityGroup extends SecurityGroupResponse {
  inboundRuleCount: number;
  outboundRuleCount: number;
  ruleSummary: string;
}

export const addSecurityGroupAction = `add-${SECURITY_GROUP.name}`;
export const editSecurityGroupAction = `edit-${SECURITY_GROUP.name}`;
export const deleteSecurityGroupAction = `delete-${SECURITY_GROUP.name}`;

/* =========================== Main Composable =========================== */
export function useSecurityDashboard() {
  // --- API Data ---
  const { data: rawGroups, refresh: refreshGroupList } =
    useResourceList<SecurityGroupResponse>(SECURITY_GROUP.name);

  // --- UI Configuration ---
  const columns: TableColumn[] = [
    { key: "name", label: "グループ名", align: "left" },
    { key: "description", label: "説明", align: "left" },
    { key: "rules", label: "イン/アウト ルール数", align: "center" },
    { key: "createdAt", label: "作成日時", align: "left" },
  ];
  const headerButtons = [{ label: "セキュリティグループ追加", action: "add" }];

  const groups = computed<UiEnhancedSecurityGroup[]>(() =>
    (rawGroups.value ?? []).map((g) => {
      const inboundRuleCount =
        g.rules?.filter((r) => r.ruleType === "inbound").length ?? 0;
      const outboundRuleCount =
        g.rules?.filter((r) => r.ruleType === "outbound").length ?? 0;
      const summary = `${inboundRuleCount} / ${outboundRuleCount}`;

      return {
        ...g,
        inboundRuleCount,
        outboundRuleCount,
        ruleSummary: summary,
        rules: summary as any, // テンプレートの #cell-rules と整合
        createdAt: formatDateTime(g.createdAt),
      };
    })
  );

  return {
    columns,
    groups,
    headerButtons,
    refreshGroupList,
    ADD_SECURITY_GROUP_ACTION: addSecurityGroupAction,
    EDIT_SECURITY_GROUP_ACTION: editSecurityGroupAction,
    DELETE_SECURITY_GROUP_ACTION: deleteSecurityGroupAction,
  };
}
