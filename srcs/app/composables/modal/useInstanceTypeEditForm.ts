import { ref } from "vue";
import { useToast } from "~/composables/useToast";
import {
  useResourceUpdater,
  type ResourceConfig,
} from "~/composables/useResourceUpdater";

// 型定義は自動インポート (InstanceTypePatchRequest, InstanceTypeResponse 等)
// ※もし自動インポートが効かない場合は適宜定義してください

export const useInstanceTypeEditForm = () => {
  const { addToast } = useToast();

  // 汎用アップデーターの初期化
  const { editedData, dirtyState, isSaving, init } =
    useResourceUpdater<InstanceTypeResponse>(); // ここで型を指定

  const updaterError = ref<string | null>(null);

  /**
   * フォーム初期化
   */
  const initializeForm = (data: InstanceTypeResponse) => {
    const config: ResourceConfig = {
      base: {
        endpoint: "", // 手動でPATCHするため空文字
        // ★ここに画像にある入力項目のキー(プロパティ名)を列挙してください
        fields: ["name", "vcpus", "memory"],
      },
      // コレクション(サブネット等)がない場合は不要
    };
    init(data, config);
    updaterError.value = null;
  };

  /**
   * 保存処理
   */
  const save = async (emit: (event: "success" | "close") => void) => {
    if (!editedData.value) return;

    isSaving.value = true;
    updaterError.value = null;

    try {
      const resourceId = editedData.value.id;
      const baseDiff = dirtyState.value.base;

      // 変更がある場合のみ送信
      if (Object.keys(baseDiff).length > 0) {
        // PATCH /api/instance-types/{id}
        await $fetch(`/api/instance-types/${resourceId}`, {
          method: "put",
          body: baseDiff as InstanceTypePatchRequest,
        });

        addToast({ type: "success", message: "保存しました。" });
        emit("success");
        emit("close");
      } else {
        addToast({ type: "info", message: "変更はありません。" });
      }
    } catch (err: any) {
      console.error(err);
      const msg =
        err.data?.message || err.message || "保存中にエラーが発生しました。";
      updaterError.value = msg;
      addToast({
        type: "error",
        message: "保存に失敗しました。",
        details: msg,
      });
    } finally {
      isSaving.value = false;
    }
  };

  return {
    editedData,
    isSaving,
    updaterError,
    initializeForm,
    save,
  };
};
