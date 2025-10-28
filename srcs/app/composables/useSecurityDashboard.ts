// ...existing code...
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
  targetIP: string;
  action: "allow" | "deny" | string;
  createdAt: string;
};

type SecurityGroupDTO = {
  id: string;
  name: string;
  description?: string;
  rules: SecurityGroupRuleDTO[];
  createdAt: string;
};

type UiSecurityGroup = {
  id: string;
  name: string;
  description: string;
  inboundRuleCount: number;
  outboundRuleCount: number;
  /** @deprecated use inboundRuleCount */
  inCount: number;
  /** @deprecated use outboundRuleCount */
  outCount: number;
  ruleSummary: string;
  rules: string;
  createdAt: string;
};

type TableColumn = {
  key: keyof UiSecurityGroup | string;
  label: string;
  align?: "left" | "center" | "right";
};

/* =========================== Utils =========================== */
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

  // columns を ref にしてテンプレ側で動的変更しやすくする
  const columns = ref<TableColumn[]>([
    { key: "name", label: "グループ名", align: "left" },
    { key: "id", label: "セキュリティグループID", align: "left" },
    { key: "description", label: "説明", align: "left" },
    // テンプレ側の #cell-rules に合わせる
    { key: "rules", label: "イン/アウト ルール数", align: "left" },
    { key: "createdAt", label: "作成日時", align: "left" },
  ]);

  const headerButtons = ref([
    { key: "create", label: "セキュリティグループ追加", kind: "primary" },
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
        inboundRuleCount,
        outboundRuleCount,
        inCount: inboundRuleCount,
        outCount: outboundRuleCount,
        ruleSummary: summary,
        rules: summary,
        createdAt: formatDateTime(g.createdAt),
      };
    })
  );

  /* ========== 安全化ラッパー ========== */
  function safeOpenModal(name: string) {
    if (typeof openModal === "function") {
      try {
        openModal(name);
      } catch (e) {
        console.error("openModal error:", e);
      }
    } else {
      console.warn("openModal is not available");
    }
  }

  function safeHandleRowAction(payload: {
    action: string;
    row: UiSecurityGroup;
  }) {
    if (typeof handleRowAction === "function") {
      try {
        handleRowAction(payload);
      } catch (e) {
        console.error("handleRowAction error:", e);
      }
    } else {
      console.warn("handleRowAction is not available");
    }
  }

  async function safeHandleDelete(...args: any[]) {
    if (typeof handleDelete === "function") {
      try {
        // handleDelete 可能ならその戻り値を返す
        return await handleDelete(...args);
      } catch (e) {
        console.error("handleDelete error:", e);
      }
    } else {
      console.warn("handleDelete is not available");
    }
  }

  function safeCancelAction(...args: any[]) {
    if (typeof cancelAction === "function") {
      try {
        return cancelAction(...args);
      } catch (e) {
        console.error("cancelAction error:", e);
      }
    } else {
      console.warn("cancelAction is not available");
    }
  }

  function safeHandleSuccess() {
    if (typeof handleSuccess === "function") {
      try {
        handleSuccess();
      } catch (e) {
        console.error("handleSuccess error:", e);
      }
    } else {
      console.warn("handleSuccess is not available");
    }
  }

  /* ========== public handlers (テンプレ用) ========== */
  function handleHeaderAction(action: string) {
    if (action !== "create") return;
    safeOpenModal("add-security-group");
  }

  function promptForDeletion(row: UiSecurityGroup) {
    safeHandleRowAction({ action: "delete", row });
  }

  /**
   * トーストのみ
   */
  function notifyOnly(message = "処理が完了しました。") {
    try {
      addToast({ type: "success", message });
    } catch (e) {
      console.error("addToast error:", e);
    }
  }

  /**
   * 通知 + 成功ハンドラ呼び出し（安全に呼ぶ）
   */
  function notifyAndHandleSuccess(message = "処理が完了しました。") {
    notifyOnly(message);
    safeHandleSuccess();
  }

  const notifySuccess = notifyAndHandleSuccess;

  return {
    columns,
    groups,
    headerButtons,
    activeModal,
    targetForDeletion,
    isDeleting,
    deletingGroupId,
    // handlers (テンプレはこれらを使用)
    handleHeaderAction,
    promptForDeletion,
    cancelAction: safeCancelAction,
    handleDelete: safeHandleDelete,
    closeModal,
    notifySuccess,
    notifyOnly,
    notifyAndHandleSuccess,
  };
}
// ...existing code...
