// srcs/app/composables/useSecurityDashboard.ts
/**
 * =================================================================================
 * セキュリティグループ ダッシュボード Composable
 * ---------------------------------------------------------------------------------
 * /api/security-groups の仕様に合わせて一覧を整形し、ページ用のハンドラを提供。
 * =================================================================================
 */
import { ref, computed } from "vue";
import { useToast } from "@/composables/useToast";
import { useResourceList } from "@/composables/useResourceList";
import { usePageActions } from "@/composables/usePageActions";

/* =========================== Types (APIに準拠) =========================== */
type SecurityGroupRuleDTO = {
  id: string;
  name: string;
  ruleType: "inbound" | "outbound";
  port?: number;
  protocol: "tcp" | "udp" | "icmp" | "any" | string;
  targetIP: string; // e.g. "0.0.0.0/0"
  action: "allow" | "deny" | string;
  createdAt: string; // ISO
};

type SecurityGroupDTO = {
  id: string;
  name: string;
  description?: string;
  rules: SecurityGroupRuleDTO[];
  createdAt: string; // ISO
};

/** テーブルUI用 */
type UiSecurityGroup = {
  id: string;
  name: string;
  description: string;
  inCount: number;
  outCount: number;
  rules: string; // "inCount / outCount"
  createdAt: string; // 表示整形済み
};

type TableColumn = {
  key: keyof UiSecurityGroup | string;
  label: string;
  align?: "left" | "center" | "right";
};

/* =========================== Utils (ローカル整形) =========================== */
function formatDateTime(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yy}-${mm}-${dd} ${hh}:${mi}`;
}

/* =========================== Main Composable =========================== */
export function useSecurityDashboard() {
  const { addToast } = useToast();

  // /api/security-groups に合わせる
  const { data: rawGroups, refresh: refreshGroupList } =
    useResourceList<SecurityGroupDTO>("security-groups");

  const {
    activeModal,
    openModal,
    closeModal,
    targetForDeletion,
    isDeleting,
    deletingId: deletingGroupId,
    handleRowAction,
    handleDelete,
    handleSuccess,
    cancelAction,
  } = usePageActions<UiSecurityGroup>({
    resourceName: "security-groups",
    resourceLabel: "セキュリティグループ",
    refresh: refreshGroupList,
  });

  const columns = ref<TableColumn[]>([
    { key: "name", label: "グループ名", align: "left" },
    { key: "id", label: "セキュリティグループID", align: "left" },
    { key: "description", label: "説明", align: "left" },
    { key: "rules", label: "イン/アウト ルール数", align: "left" },
    { key: "createdAt", label: "作成日時", align: "left" },
  ]);

  const headerButtons = ref([
    { label: "セキュリティグループ追加", action: "add" },
  ]);

  const groups = computed<UiSecurityGroup[]>(() =>
    (rawGroups.value ?? []).map((g) => {
      const inCount =
        g.rules?.filter((r) => r.ruleType === "inbound").length ?? 0;
      const outCount =
        g.rules?.filter((r) => r.ruleType === "outbound").length ?? 0;
      return {
        id: g.id,
        name: g.name,
        description: g.description ?? "",
        inCount,
        outCount,
        rules: `${inCount} / ${outCount}`,
        createdAt: formatDateTime(g.createdAt),
      };
    })
  );

  function handleHeaderAction(action: string) {
    if (action !== "add") return;
    openModal("add-security-group");
  }

  function promptForDeletion(row: UiSecurityGroup) {
    handleRowAction({ action: "delete", row });
  }

  function notifySuccess(message = "処理が完了しました。") {
    addToast({ type: "success", message });
    handleSuccess();
  }

  return {
    // table
    columns,
    groups,
    headerButtons,
    // actions state
    activeModal,
    targetForDeletion,
    isDeleting,
    deletingGroupId,
    // handlers
    handleHeaderAction,
    promptForDeletion,
    cancelAction,
    handleDelete,
    closeModal,
    notifySuccess,
  };
}
