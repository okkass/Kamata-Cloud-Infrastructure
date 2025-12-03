import { ref, computed, watch } from "vue";
import { useToast } from "~/composables/useToast";
import {
  useResourceUpdater,
  type ResourceConfig,
} from "~/composables/useResourceUpdater";

type SecurityRuleProtocol = "tcp" | "udp" | "icmp" | "any";
type SecurityRuleAction = "allow" | "deny";
type SecurityRuleType = "inbound" | "outbound";

interface Props {
  show: boolean;
  securityGroupData: SecurityGroupResponse | null;
}

export const PROTOCOL_OPTIONS: SecurityRuleProtocol[] = [
  "tcp",
  "udp",
  "icmp",
  "any",
];
export const ACTION_OPTIONS: SecurityRuleAction[] = ["allow", "deny"];

export function useSecurityGroupEditForm(props: Props) {
  const { addToast } = useToast();

  const { editedData, init, save, isDirty, isSaving } =
    useResourceUpdater<SecurityGroupResponse>();

  // --- 初期化ロジック ---
  watch(
    () => [props.show, props.securityGroupData] as const,
    ([show, data]) => {
      if (show && data) {
        init(data, getResourceConfig(data));
      }
    },
    { immediate: true }
  );

  function getResourceConfig(data: SecurityGroupResponse): ResourceConfig {
    return {
      base: {
        endpoint: `/api/security-groups/${data.id}`,
        fields: ["name", "description"],
      },
      collections: {
        rules: {
          endpoint: `/api/security-groups/${data.id}/rules`,
          idKey: "id",
          newIdPrefix: "new-",
          fields: [
            "name",
            "protocol",
            "port",
            "targetIp",
            "action",
            "ruleType",
          ],
        },
      },
    };
  }

  // --- バリデーション ---
  const errors = ref<Record<string, string>>({});

  const validate = (): boolean => {
    errors.value = {};
    if (!editedData.value) return false;

    if (!editedData.value.name?.trim()) {
      errors.value.name = "グループ名は必須です。";
    }

    editedData.value.rules?.forEach((rule, index) => {
      if (!rule.name?.trim()) {
        errors.value[`${rule.id}.name`] = "必須";
      }
      if (!rule.targetIp?.trim()) {
        errors.value[`${rule.id}.targetIp`] = "必須";
      }
    });

    return Object.keys(errors.value).length === 0;
  };

  // --- 送信ハンドラ ---
  const onFormSubmit = (emit: (event: "close" | "success") => void) => {
    return async () => {
      if (!validate()) {
        addToast({ type: "error", message: "入力内容を確認してください。" });
        return;
      }

      const success = await save();

      if (success) {
        addToast({
          type: "success",
          message: `セキュリティグループ「${editedData.value?.name}」を更新しました。`,
        });
        emit("success");
        emit("close");
      } else {
        addToast({ type: "error", message: "更新に失敗しました。" });
      }
    };
  };

  // --- ルール操作ヘルパー ---

  // 新規ルール作成のファクトリ関数
  const createNewRule = (type: SecurityRuleType): SecurityRuleResponse => ({
    // 一時ID生成 (UUIDの簡易版としてランダム文字列を使用)
    id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name: "New Rule",
    ruleType: type,
    protocol: "tcp", // 文字列リテラルで指定
    port: null,
    targetIp: "0.0.0.0/0",
    action: "allow", // 文字列リテラルで指定
    createdAt: new Date().toISOString(),
  });

  // 共通化されたルール追加関数
  const addRule = (type: SecurityRuleType) => {
    if (!editedData.value) return;

    // rules が未定義の場合は空配列で初期化
    if (!editedData.value.rules) {
      editedData.value.rules = [];
    }

    editedData.value.rules.push(createNewRule(type));
  };

  // 特定のIDを持つルールを削除
  const removeRule = (ruleId: string) => {
    if (!editedData.value?.rules) return;

    const index = editedData.value.rules.findIndex((r) => r.id === ruleId);
    if (index !== -1) {
      editedData.value.rules.splice(index, 1);
    }
  };

  // Computed: フィルタリング
  const inboundRules = computed(
    () => editedData.value?.rules?.filter((r) => r.ruleType === "inbound") ?? []
  );

  const outboundRules = computed(
    () =>
      editedData.value?.rules?.filter((r) => r.ruleType === "outbound") ?? []
  );

  return {
    // State
    editedData,
    errors,
    isDirty,
    isSaving,

    // Options (定数を返す)
    protocolOptions: PROTOCOL_OPTIONS,
    actionOptions: ACTION_OPTIONS,

    // Computed Lists
    inboundRules,
    outboundRules,

    // Methods
    onFormSubmit,
    addInboundRule: () => addRule("inbound"),
    addOutboundRule: () => addRule("outbound"),
    // テンプレート側からは id を渡すだけで済むように変更
    removeRule,
  };
}
