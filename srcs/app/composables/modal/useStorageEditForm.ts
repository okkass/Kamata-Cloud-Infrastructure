/**
 * =================================================================================
 * ストレージプール編集フォーム Composable (useStorageEditForm.ts)
 * ---------------------------------------------------------------------------------
 * ・useResourceUpdater を使用して差分更新 (PATCH)
 * ・監視対象: name, hasNetworkAccess
 * =================================================================================
 */
import { ref, watch, computed } from "vue";
import { useToast } from "~/composables/useToast";
import {
  useResourceUpdater,
  type ResourceConfig,
} from "~/composables/useResourceUpdater";

// 型定義は自動インポート (StoragePoolPatchRequest 等)
// ただし useResourceUpdater には元のデータ型(DTO)を渡す必要があるため、
// 便宜上 any か既存のDTO型を指定します（ここでは汎用的に T とします）

interface Props {
  show: boolean;
  storageData: any | null; // 本来は StoragePoolDTO 等
}

export function useStorageEditForm(props: Props) {
  const { addToast } = useToast();

  // useResourceUpdater の初期化
  const { editedData, init, save, isDirty, isSaving } =
    useResourceUpdater<any>();

  // モーダル表示時にデータを初期化
  watch(
    () => [props.show, props.storageData],
    ([show, data]) => {
      if (show && data) {
        init(data, getResourceConfig(data));
      }
    },
    { immediate: true }
  );

  // リソース設定 (PATCHエンドポイントと監視フィールド)
  function getResourceConfig(data: any): ResourceConfig {
    return {
      base: {
        // 要件: エンドポイントは /storage-pools/{id}
        // (プロジェクトの慣習に従い /api を付与しています)
        endpoint: `storage-pools/${data.id}`,

        // StoragePoolPatchRequest に含まれる変更可能なフィールド
        fields: ["name", "hasNetworkAccess"],
      },
    };
  }

  // --- バリデーション (簡易) ---
  const errors = ref<Record<string, string>>({});

  const validate = (): boolean => {
    errors.value = {};
    let isValid = true;

    if (!editedData.value) return false;

    if (!editedData.value.name) {
      errors.value.name = "プール名は必須です。";
      isValid = false;
    }

    return isValid;
  };

  // --- 送信ハンドラ ---
  const onFormSubmit = (emit: (event: "close" | "success") => void) => {
    return async () => {
      if (!validate()) {
        addToast({ type: "error", message: "入力内容を確認してください。" });
        return;
      }

      // 差分がある場合のみ PATCH が飛びます
      const success = await save();

      if (success) {
        addToast({
          type: "success",
          message: `ストレージプール「${editedData.value?.name}」を更新しました。`,
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

  return {
    editedData,
    errors,
    isDirty,
    isSaving,
    onFormSubmit,
  };
}
