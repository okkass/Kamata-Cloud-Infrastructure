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

  // タブの管理
  const activeTab = ref<"general" | "config" | "network">("general");

  // useResourceUpdater の初期化
  const {
    editedData, // これを各タブの v-model に渡します
    isSaving,
    init,
    save: saveResource, // 名前重複回避のためエイリアス
    isDirty,
  } = useResourceUpdater<any>();

  const updaterError = ref<string | null>(null);

  /**
   * フォーム初期化
   * 親コンポーネントで watch(() => props.vmData, ...) の中で呼び出されます
   */
  const initializeForm = (data: any) => {
    // 1. メモリ単位変換 (Bytes -> GB)
    // UI上ではGBで扱いたいので、初期化時に変換します
    const formattedData = {
      ...data,
      memorySize: convertByteToUnit(data.memorySize, "GB"),
    };

    const id = data.id;

    // 2. ResourceUpdater の設定
    // ★重要: 先頭の "/" を削除して重複を防いでいます
    const config: ResourceConfig = {
      base: {
        // Base情報の PATCH 先: /api/virtual-machines/{id}
        endpoint: `virtual-machines/${id}`,
        fields: ["name", "description", "cpuCore", "memorySize"],
      },
      collections: {
        storages: {
          endpoint: "", // bulk使用時は未使用
          // Bulk送信先: /api/virtual-machines/{id}/storages/bulk
          bulkEndpoint: `virtual-machines/${id}/storages/bulk`,
          idKey: "id",
          newIdPrefix: "new-", // UI側で新規作成時に "new-xxx" というIDを振る必要があります
          fields: ["name", "size", "poolId", "type"],
          bulkKeys: { create: "add", update: "patch", delete: "remove" },
        },
        networkInterfaces: {
          endpoint: "",
          bulkEndpoint: `virtual-machines/${id}/network-interfaces/bulk`,
          idKey: "id", // ネットワークIF自体がIDを持つ前提
          newIdPrefix: "new-",
          fields: ["networkId", "ipAddress"],
          bulkKeys: { create: "add", update: "patch", delete: "remove" },
        },
        securityGroups: {
          endpoint: "",
          bulkEndpoint: `virtual-machines/${id}/security-groups/bulk`,
          idKey: "id",
          newIdPrefix: "new-",
          fields: [], // SGはIDの紐付けのみなのでフィールド監視は不要
          bulkKeys: { create: "add", delete: "remove" },
          isAttachable: true,
        },
      },
    };

    init(formattedData, config);
    updaterError.value = null;

    // 初期化時は General タブを表示
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

      // UI表示用に GB に戻す (成功しても失敗しても、画面が開いたままならGBに戻しておく)
      editedData.value.memorySize = currentMemoryGB;

      if (success) {
        addToast({ type: "success", message: "保存しました。" });
        emit("success");
        emit("close");
      } else {
        // useResourceUpdater 内部でエラー時は false が返り、errorMessage に詳細が入る想定ですが、
        // ここでは汎用メッセージを出しています。必要に応じて updaterError を参照してください。
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
