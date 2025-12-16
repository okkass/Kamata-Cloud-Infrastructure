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
  // $fetch はグローバルを使用 (必要に応じて const { $fetch } = useNuxtApp() )

  // タブ管理
  const activeTab = ref<"general" | "config" | "network">("general");

  // リソースアップデーター (Base情報のみ自動管理、Collectionsは手動管理)
  const { originalData, editedData, dirtyState, isSaving, init } =
    useResourceUpdater<any>(); // 型: VirtualMachineResponse

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

    // 2. ResourceUpdater初期化
    // Collections (Storage/Network/SG) はこのConfigには含めず、手動で管理します
    const config: ResourceConfig = {
      base: {
        endpoint: "", // 手動PATCHのため空文字
        fields: ["name", "description", "cpuCore", "memorySize"],
      },
      // collections は空にしておく
    };

    init(formattedData, config);
    updaterError.value = null;
    activeTab.value = "general";
  };

  /**
   * JSON文字列比較による簡易差分検知
   */
  const hasDiff = (key: string): boolean => {
    if (!originalData.value || !editedData.value) return false;
    // 順序も厳密に比較します
    return (
      JSON.stringify(originalData.value[key]) !==
      JSON.stringify(editedData.value[key])
    );
  };

  /**
   * 保存処理
   */
  const save = async (emit: (event: "success" | "close") => void) => {
    if (!editedData.value) return;

    isSaving.value = true;
    updaterError.value = null;
    const resourceId = editedData.value.id;
    const promises: Promise<any>[] = [];
    let hasChanges = false;

    try {
      // ---------------------------------------------------------
      // 1. 基本情報 (Base) -> PATCH /virtual-machines/{id}
      // ---------------------------------------------------------
      const baseDiff = { ...dirtyState.value.base };

      // メモリ変更があれば GB -> Bytes に戻す
      if (typeof baseDiff.memorySize === "number") {
        baseDiff.memorySize = convertUnitToByte(baseDiff.memorySize, "GB");
      }

      if (Object.keys(baseDiff).length > 0) {
        hasChanges = true;
        promises.push(
          $fetch(`/api/virtual-machines/${resourceId}`, {
            method: "PATCH",
            body: baseDiff,
          })
        );
      }

      // ---------------------------------------------------------
      // 2. ストレージ -> POST /virtual-machines/{id}/storages/bulk
      // ---------------------------------------------------------
      if (hasDiff("storages")) {
        hasChanges = true;
        promises.push(
          $fetch(`/api/virtual-machines/${resourceId}/storages/bulk`, {
            method: "POST",
            body: editedData.value.storages,
          })
        );
      }

      // ---------------------------------------------------------
      // 3. ネットワーク -> POST /virtual-machines/{id}/network-interfaces/bulk
      // ---------------------------------------------------------
      // APIパス: .../network-interfaces/bulk (仮)
      // データキー: networkInterfaces (仮)
      if (hasDiff("networkInterfaces")) {
        hasChanges = true;
        promises.push(
          $fetch(
            `/api/virtual-machines/${resourceId}/network-interfaces/bulk`,
            {
              method: "POST",
              body: editedData.value.networkInterfaces,
            }
          )
        );
      }

      // ---------------------------------------------------------
      // 4. セキュリティグループ -> POST /virtual-machines/{id}/security-groups/bulk
      // ---------------------------------------------------------
      // データキー: securityGroups (仮)
      // ※パスに {id} を含める形で実装しています
      if (hasDiff("securityGroups")) {
        hasChanges = true;
        promises.push(
          $fetch(`/api/virtual-machines/${resourceId}/security-groups/bulk`, {
            method: "POST",
            body: editedData.value.securityGroups,
          })
        );
      }

      // ---------------------------------------------------------
      // 実行
      // ---------------------------------------------------------
      if (!hasChanges) {
        addToast({ type: "info", message: "変更はありません。" });
        isSaving.value = false;
        return;
      }

      await Promise.all(promises);

      addToast({ type: "success", message: "保存しました。" });
      emit("success");
      emit("close");
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
    activeTab,
    editedData,
    isSaving,
    updaterError,
    initializeForm,
    save,
  };
};
