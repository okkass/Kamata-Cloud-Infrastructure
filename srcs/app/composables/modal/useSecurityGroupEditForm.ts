/**
 * =================================================================================
 * セキュリティグループ編集フォーム Composable (useSecurityGroupEditForm.ts)
 * ---------------------------------------------------------------------------------
 * ★ useResourceUpdater を使用して変更検知とPATCHリクエストを行う
 * ★ 初期値からの差分のみを送信
 * =================================================================================
 */
import { ref, computed, watch, reactive } from "vue";
import { useToast } from "~/composables/useToast";
import {
  useResourceUpdater,
  type ResourceConfig,
} from "~/composables/useResourceUpdater";

// 型定義のインポート
import type { SecurityGroupDTO } from "~~/shared/types/dto/security-group/SecurityGroupDTO";
import type { SecurityRuleDTO } from "~~/shared/types/dto/security-group/SecurityRuleDTO";
import {
  SecurityRuleProtocolEnum,
  SecurityRuleActionEnum,
  SecurityRuleRuleTypeEnum,
} from "~~/shared/types/dto/security-group/SecurityRuleDTO";

// Props定義
interface Props {
  show: boolean;
  securityGroupData: SecurityGroupDTO | null;
}

/**
 * セキュリティグループ編集フォームのロジック
 */
export function useSecurityGroupEditForm(props: Props) {
  const { addToast } = useToast();

  // -------------------------------------------------------
  // 1. データの初期化 (editedData)
  // -------------------------------------------------------
  // useResourceUpdater が管理する編集用データ
  const { editedData, init, isDirty, save, reset, isSaving } =
    useResourceUpdater<SecurityGroupDTO>();

  // モーダルが開かれたり、データが変わったりした時に初期化
  watch(
    () => [props.show, props.securityGroupData],
    ([show, data]) => {
      if (show && data) {
        // useResourceUpdater の初期化 (初期値のディープコピーを作成)
        init(
          data as SecurityGroupDTO,
          getResourceConfig(data as SecurityGroupDTO)
        );
      }
    },
    { immediate: true }
  );

  // -------------------------------------------------------
  // 2. リソース設定 (ResourceConfig)
  // どのデータが変更されたら、どのアドレスにPATCHを送るかを定義
  // -------------------------------------------------------
  function getResourceConfig(data: SecurityGroupDTO): ResourceConfig {
    return {
      // 基本情報の更新設定 (PATCH /api/security-groups/{id})
      base: {
        endpoint: `/api/security-groups/${data.id}`,
        fields: ["name", "description"], // 変更を監視するフィールド
      },

      // ルールの更新設定
      collections: {
        rules: {
          // API仕様: /api/security-groups/{groupId}/rules/{ruleId}
          // (新規追加は POST .../rules, 削除は DELETE .../rules/{ruleId} と仮定)
          endpoint: `/api/security-groups/${data.id}/rules`,
          idKey: "id",
          newIdPrefix: "new-", // 新規追加アイテムの仮IDプレフィックス
          // 変更を監視するフィールド
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

  // -------------------------------------------------------
  // 3. UI用ヘルパー (バリデーションなど)
  // -------------------------------------------------------
  // 簡易バリデーションエラー管理
  const errors = ref<Record<string, string>>({});

  const validate = (): boolean => {
    errors.value = {};
    let isValid = true;

    if (!editedData.value?.name) {
      errors.value.name = "グループ名は必須です。";
      isValid = false;
    }

    // ルールのバリデーション (必要に応じて追加)
    editedData.value?.rules?.forEach((rule: any, index: number) => {
      if (!rule.name) {
        errors.value[`rules[${index}].name`] = "ルール名は必須です。";
        isValid = false;
      }
      if (!rule.targetIp) {
        errors.value[`rules[${index}].targetIp`] = "ターゲットIPは必須です。";
        isValid = false;
      }
    });

    return isValid;
  };

  // -------------------------------------------------------
  // 4. 送信ハンドラ
  // -------------------------------------------------------
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

  // -------------------------------------------------------
  // 5. ルール操作 (UI用)
  // -------------------------------------------------------
  // 新規ルール作成ヘルパー
  const createNewRule = (type: SecurityRuleRuleTypeEnum): any => ({
    id: `new-${Date.now()}-${Math.random()}`, // 仮ID
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

  // インバウンド/アウトバウンドのフィルタリング (UI表示用)
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

  // 元の配列でのインデックスを探すヘルパー (削除用)
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
    // ルール関連
    inboundRules,
    outboundRules,
    addInboundRule,
    addOutboundRule,
    removeRule,
    getOriginalIndex,
    // 定数 (Select用)
    protocolOptions: Object.values(SecurityRuleProtocolEnum),
    actionOptions: Object.values(SecurityRuleActionEnum),
  };
}
