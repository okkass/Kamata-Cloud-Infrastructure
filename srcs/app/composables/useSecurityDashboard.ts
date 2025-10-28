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

/** テーブルUI用（明示的なフィールド名を追加、互換のため旧名も残す） */
type UiSecurityGroup = {
  id: string;
  name: string;
  description: string;
  // より明示的なフィールド名
  inboundRuleCount: number;
  outboundRuleCount: number;
  // 既存コード互換のためのエイリアス
  inCount: number;
  outCount: number;
  // 表示用の文字列（新旧両方用意）
  ruleSummary: string; // e.g. "1 / 2"
  rules: string;
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
    { key: "ruleSummary", label: "イン/アウト ルール数", align: "left" },
    { key: "createdAt", label: "作成日時", align: "left" },
  ]);

  const headerButtons = ref([
    { label: "セキュリティグループ追加", action: "add" },
  ]);

  const groups = computed<UiSecurityGroup[]>(() =>
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
        // 既存互換フィールド（すぐに破壊的変更しないためのエイリアス）
        inCount: inboundRuleCount,
        outCount: outboundRuleCount,
        // 表示用文字列（新旧両方提供）
        ruleSummary: summary,
        rules: summary,
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

  /**
   * トーストのみ（通知責務のみ）
   */
  function notifyOnly(message = "処理が完了しました。") {
    addToast({ type: "success", message });
  }

  /**
   * 通知 + ページ状態更新（既存の notifySuccess 相当の振る舞い）
   * 名前を明示的にして責務を分離。
   */
  function notifyAndHandleSuccess(message = "処理が完了しました。") {
    addToast({ type: "success", message });
    handleSuccess();
  }

  // 互換性のため、既存呼び出し名を notifySuccess として提供（既存コードが依存している場合に安全）
  const notifySuccess = notifyAndHandleSuccess;

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
    // notify: 明示的関数を両方提供
    notifySuccess, // 既存互換（通知 + handleSuccess）
    notifyOnly, // トーストだけを行いたい場合はこちら
    notifyAndHandleSuccess, // 明示的な名前
  };
}
