/**
 * =================================================================================
 * セキュリティグループ ダッシュボード Composable
 * ---------------------------------------------------------------------------------
 * /api/security-groups の仕様に合わせて一覧を整形し、ページ用のハンドラを提供。
 * =================================================================================
 */
import { computed } from "vue";
import { useResourceList } from "@/composables/useResourceList";
/* =========================== Types (APIに準拠) =========================== */

/** テーブルUI用（明示的なフィールド名を追加） */
/** Omitして型衝突を回避 */
interface UiEnhancedSecurityGroup extends Omit<SecurityGroupDTO, "rules"> {
  inboundRuleCount: number;
  outboundRuleCount: number;
}

/* =========================== Main Composable =========================== */
export function useSecurityDashboard() {
  // --- API Data ---
  const { data: rawGroups, refresh: refreshGroupList } =
    useResourceList<SecurityGroupDTO>("security-groups");

  // --- UI Configuration ---
  const columns: TableColumn[] = [
    { key: "name", label: "グループ名", align: "left" },
    { key: "id", label: "セキュリティグループID", align: "left" },
    { key: "description", label: "説明", align: "left" },
    { key: "rules", label: "イン/アウト ルール数", align: "left" },
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
        id: g.id,
        name: g.name,
        description: g.description ?? "",
        // 新しい明示的フィールド
        inboundRuleCount,
        outboundRuleCount,
        // 既存互換フィールド（deprecated）
        inCount: inboundRuleCount,
        outCount: outboundRuleCount,
        // 表示用文字列（両方提供）
        ruleSummary: summary,
        rules: summary, // テンプレートの #cell-rules と整合
        createdAt: formatDateTime(g.createdAt),
      };
    })
  );

  return {
    columns,
    groups,
    headerButtons,
    refreshGroupList,
  };
}
