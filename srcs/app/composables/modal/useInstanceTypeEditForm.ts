import { ref } from "vue";
import { useToast } from "~/composables/useToast";
import {
  useResourceUpdater,
  type ResourceConfig,
} from "~/composables/useResourceUpdater";

import { convertByteToUnit, convertUnitToByte } from "~/utils/format";

export const useInstanceTypeEditForm = () => {
  const { addToast } = useToast();

  const { editedData, dirtyState, isSaving, init } = useResourceUpdater<any>(); // 型エラー回避のため一旦 any または適切な型を指定

  const updaterError = ref<string | null>(null);

  /**
   * フォーム初期化
   */
  const initializeForm = (data: any) => {
    // 初期化時にメモリ(Bytes)をUI用単位(GB)に変換
    const formattedData = {
      ...data,
      // APIのフィールド名に合わせて変換
      // もし data.vcpus で来ている場合は data.cpuCore にマッピングする等の調整が必要ですが、
      // ここでは仕様書のフィールド名(memorySize)を正として扱います。
      memorySize: convertByteToUnit(data.memorySize, "GB"),
    };

    const config: ResourceConfig = {
      base: {
        endpoint: "", // 手動PATCHのため空文字
        fields: ["name", "cpuCore", "memorySize"],
      },
    };

    init(formattedData, config);
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

      // 1. 差分オブジェクトのコピーを作成
      const baseDiff = { ...dirtyState.value.base };

      // 2. メモリに変更がある場合、GB(数値) -> Bytes(数値) に逆変換する
      if (typeof baseDiff.memorySize === "number") {
        baseDiff.memorySize = convertUnitToByte(baseDiff.memorySize, "GB");
      }

      // 差分がある場合のみ送信
      if (Object.keys(baseDiff).length > 0) {
        await $fetch(`/api/instance-types/${resourceId}`, {
          method: "PUT",
          body: baseDiff,
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
