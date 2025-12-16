import { ref, computed } from "vue";
import { useToast } from "~/composables/useToast";
import {
  useResourceUpdater,
  type ResourceConfig,
} from "~/composables/useResourceUpdater";

import { convertByteToUnit, convertUnitToByte } from "~/utils/format";

export const useInstanceTypeEditForm = () => {
  const { addToast } = useToast();

  // [推奨]: useResourceUpdater の戻り値を活用
  const {
    editedData,
    dirtyState,
    isSaving,
    init,
    save: updaterSave,
    errorMessage,
  } = useResourceUpdater<InstanceTypeResponse>();

  // エラーメッセージを同期
  const updaterError = errorMessage;

  // [必須]: メモリサイズ(Bytes)とUI表示(GB)の変換用Computed
  const memorySizeGB = computed({
    get: () => {
      if (!editedData.value) return 0;
      return convertByteToUnit(editedData.value.memorySize, "GB");
    },
    set: (val) => {
      if (editedData.value) {
        editedData.value.memorySize = convertUnitToByte(val, "GB");
      }
    },
  });

  /**
   * フォーム初期化
   */
  const initializeForm = (data: InstanceTypeResponse) => {
    // [推奨]: endpoint を設定し、データ変換は行わない (Bytesのまま扱う)
    const config: ResourceConfig = {
      base: {
        endpoint: `/api/instance-types/${data.id}`,
        fields: ["name", "cpuCore", "memorySize"],
      },
    };

    init(data, config);
  };

  /**
   * 保存処理
   * [推奨]: useResourceUpdater の save() を使用して標準化
   */
  const save = async (emit: (event: "success" | "close") => void) => {
    if (!editedData.value) return;

    const success = await updaterSave();

    if (success) {
      addToast({ type: "success", message: "保存しました。" });
      emit("success");
      emit("close");
    } else {
      addToast({
        type: "error",
        message: "保存に失敗しました。",
        details: updaterError.value || undefined,
      });
    }
  };

  return {
    editedData,
    memorySizeGB, // 追加
    dirtyState, // [推奨]: dirtyState を公開
    isSaving,
    updaterError,
    initializeForm,
    save,
  };
};
