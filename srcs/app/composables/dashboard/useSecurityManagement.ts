/**
 * =================================================================================
 * セキュリティグループ ダッシュボード Composable
 * =================================================================================
 */
import { computed, onMounted, onUnmounted } from "vue";
import { useResourceList } from "@/composables/useResourceList";
import { useUserPermission } from "@/composables/useUserPermission";
import { createPolling } from "@/utils/polling";
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
  const { fetchUser, isAdmin, isSecurityGroupAdmin } = useUserPermission();
  void fetchUser();

  const isManager = computed(
    () => isAdmin.value === true || isSecurityGroupAdmin.value === true
  );

  // --- API Data ---
  const queryOptions = computed(() => {
    return isManager.value ? { scope: "all" } : undefined;
  });

  const { data: rawGroups, refresh: refreshGroupList } =
    useResourceList<SecurityGroupResponse>(SECURITY_GROUP.name, queryOptions);

  // --- Polling ---
  const { startPolling, runOnce, stopPolling } = createPolling(async () => {
    await refreshGroupList();
  }, 3000);

  onMounted(() => {
    void runOnce();
    startPolling();
  });

  onUnmounted(() => {
    stopPolling();
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

  return {
    columns,
    groups,
    isManager,
    headerButtons,
    refreshGroupList,
    ADD_SECURITY_GROUP_ACTION: addSecurityGroupAction,
    EDIT_SECURITY_GROUP_ACTION: editSecurityGroupAction,
    DELETE_SECURITY_GROUP_ACTION: deleteSecurityGroupAction,
  };
}
