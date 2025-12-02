/**
 * =================================================================================
 * セキュリティグループ編集フォーム Composable (useSecurityGroupEditForm.ts)
 * =================================================================================
 */
import { ref, computed, watch } from "vue";
import { useToast } from "~/composables/useToast";
import {
  useResourceUpdater,
  type ResourceConfig,
} from "~/composables/useResourceUpdater";

import type { SecurityGroupDTO } from "~~/shared/types/dto/security-group/SecurityGroupDTO";
import {
  SecurityRuleProtocolEnum,
  SecurityRuleActionEnum,
  SecurityRuleRuleTypeEnum,
} from "~~/shared/types/dto/security-group/SecurityRuleDTO";

interface Props {
  show: boolean;
  securityGroupData: SecurityGroupDTO | null;
}

export function useSecurityGroupEditForm(props: Props) {
  const { addToast } = useToast();

  // useResourceUpdater から editedData と init を受け取る
  const { editedData, init, save, isDirty, isSaving } =
    useResourceUpdater<SecurityGroupDTO>();

  // モーダルが開いたとき、またはデータが変わったときに初期化
  watch(
    () => [props.show, props.securityGroupData],
    ([show, data]) => {
      if (show && data) {
        init(
          data as SecurityGroupDTO,
          getResourceConfig(data as SecurityGroupDTO)
        );
      }
    },
    { immediate: true }
  );

  function getResourceConfig(data: SecurityGroupDTO): ResourceConfig {
    return {
      // 1. セキュリティグループ本体の更新
      base: {
        endpoint: `/api/security-groups/${data.id}`,
        fields: ["name", "description"],
      },

      // 2. ルールの更新
      collections: {
        rules: {
          // useResourceUpdater が自動的に末尾に `/{ruleId}` (やPOST時のbody) を扱います。
          // ここではベースとなる `.../rules` までを指定します。
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
    let isValid = true;

    if (!editedData.value) return false;

    if (!editedData.value.name) {
      errors.value.name = "グループ名は必須です。";
      isValid = false;
    }

    editedData.value.rules?.forEach((rule: any, index: number) => {
      if (!rule.name) {
        errors.value[`rules[${index}].name`] = "必須";
        isValid = false;
      }
      if (!rule.targetIp) {
        errors.value[`rules[${index}].targetIp`] = "必須";
        isValid = false;
      }
    });

    return isValid;
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
        addToast({
          type: "error",
          message: "更新に失敗しました。",
        });
      }
    };
  };

  // --- ルール操作ヘルパー ---
  const createNewRule = (type: SecurityRuleRuleTypeEnum): any => ({
    id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: "New Rule",
    ruleType: type,
    protocol: SecurityRuleProtocolEnum.Tcp,
    port: null,
    targetIp: "0.0.0.0/0",
    action: SecurityRuleActionEnum.Allow,
  });

  const addInboundRule = () => {
    if (!editedData.value) return;
    if (!editedData.value.rules) editedData.value.rules = [];
    editedData.value.rules.push(
      createNewRule(SecurityRuleRuleTypeEnum.Inbound)
    );
  };

  const addOutboundRule = () => {
    if (!editedData.value) return;
    if (!editedData.value.rules) editedData.value.rules = [];
    editedData.value.rules.push(
      createNewRule(SecurityRuleRuleTypeEnum.Outbound)
    );
  };

  const removeRule = (index: number) => {
    if (!editedData.value?.rules) return;
    editedData.value.rules.splice(index, 1);
  };

  const inboundRules = computed(() =>
    (editedData.value?.rules || []).filter(
      (r: any) => r.ruleType === SecurityRuleRuleTypeEnum.Inbound
    )
  );
  const outboundRules = computed(() =>
    (editedData.value?.rules || []).filter(
      (r: any) => r.ruleType === SecurityRuleRuleTypeEnum.Outbound
    )
  );

  const getOriginalIndex = (rule: any) => {
    return (
      editedData.value?.rules?.findIndex((r: any) => r.id === rule.id) ?? -1
    );
  };

  return {
    editedData,
    errors,
    isDirty,
    isSaving,
    onFormSubmit,
    inboundRules,
    outboundRules,
    addInboundRule,
    addOutboundRule,
    removeRule: (rule: any) => removeRule(getOriginalIndex(rule)),
    protocolOptions: Object.values(SecurityRuleProtocolEnum),
    actionOptions: Object.values(SecurityRuleActionEnum),
  };
}
