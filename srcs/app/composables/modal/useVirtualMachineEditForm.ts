import { ref } from "vue";
import { useToast } from "~/composables/useToast";
import {
  useResourceUpdater,
  type ResourceConfig,
} from "~/composables/useResourceUpdater";
import { convertByteToUnit, convertUnitToByte } from "~/utils/format";

// 型定義 (環境に合わせて適宜調整してください)
// import type { VirtualMachineResponse } from "~/shared/types";

export const useVirtualMachineEditForm = () => {
  const { addToast } = useToast();
  // $fetch は useResourceUpdater 内部の useApiClient で処理されるため、ここでの明示的な取得は不要な場合がありますが、
  // 環境依存のエラーを避けるため Nuxt のコンテキストから取得しておくのが無難です。
  // const { $fetch } = useNuxtApp();

  const activeTab = ref<"general" | "config" | "network">("general");

  // useResourceUpdater の初期化
  const {
    editedData, // これを各タブの v-model に渡します
    isSaving,
    init,
    save: saveResource, // 名前重複回避
    isDirty,
  } = useResourceUpdater<any>();

  const updaterError = ref<string | null>(null);

  /**
   * フォーム初期化
   */
  const initializeForm = (data: any) => {
    // 1. メモリ単位変換 (Bytes -> GB)
    const formattedData = {
      ...data,
      memorySize: convertByteToUnit(data.memorySize, "GB"),
    };

    const id = data.id;

    // 2. ResourceUpdater の設定
    // サーバーのAPIパスに合わせて endpoint を構築します
    const config: ResourceConfig = {
      base: {
        // 先頭の /api/ を削除
        endpoint: `virtual-machines/${id}`,
        fields: ["name", "description", "cpuCore", "memorySize"],
      },
      collections: {
        storages: {
          endpoint: "",
          // 先頭の /api/ を削除
          bulkEndpoint: `virtual-machines/${id}/storages/bulk`,
          idKey: "id",
          newIdPrefix: "new-",
          fields: ["name", "size", "poolId", "type"],
        },
        networkInterfaces: {
          endpoint: "",
          // 先頭の /api/ を削除
          bulkEndpoint: `virtual-machines/${id}/network-interfaces/bulk`,
          idKey: "id", // ※前回修正した通り、networkInterfacesもID管理が必要です
          newIdPrefix: "new-",
          fields: ["networkId", "ipAddress"],
        },
        securityGroups: {
          endpoint: "",
          // 先頭の /api/ を削除
          bulkEndpoint: `virtual-machines/${id}/security-groups/bulk`,
          idKey: "id",
          newIdPrefix: "new-",
          fields: ["name"],
        },
      },
    };

    init(formattedData, config);
    updaterError.value = null;
    activeTab.value = "general";
  };

  /**
   * 保存処理
   */
  const save = async (emit: (event: "success" | "close") => void) => {
    if (!editedData.value) return;

    // 保存開始
    isSaving.value = true;
    updaterError.value = null;

    try {
      // メモリ単位の逆変換 (GB -> Bytes)
      // ResourceUpdater は editedData を直接参照して差分判定するため、
      // 一時的に数値をAPI仕様(Bytes)に戻してあげる必要があります。
      const currentMemoryGB = editedData.value.memorySize;
      editedData.value.memorySize = convertUnitToByte(currentMemoryGB, "GB");

      // useResourceUpdater の save を実行
      // これが config に従って PATCH (Base) や POST (Bulk) を自動で投げ分けます
      const success = await saveResource();

      // UI表示用に GB に戻す
      editedData.value.memorySize = currentMemoryGB;

      if (success) {
        addToast({ type: "success", message: "保存しました。" });
        emit("success");
        emit("close");
      } else {
        // useResourceUpdater 内部でエラー時は false が返る
        updaterError.value = "保存に失敗しました。";
      }
    } catch (err: any) {
      console.error(err);
      updaterError.value = "予期せぬエラーが発生しました。";
    } finally {
      isSaving.value = false;
    }
  };

  return {
    activeTab,
    editedData,
    isSaving,
    isDirty, // 保存ボタンの活性制御に使えます
    updaterError,
    initializeForm,
    save,
  };
};
