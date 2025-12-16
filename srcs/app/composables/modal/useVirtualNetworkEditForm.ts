import { useToast } from "~/composables/useToast";
import {
  useResourceUpdater,
  type ResourceConfig,
} from "~/composables/useResourceUpdater";

export const useVirtualNetworkEditForm = () => {
  const { addToast } = useToast();

  // Bulk対応版の useResourceUpdater を使用
  const { 
    editedData, 
    isSaving, 
    errorMessage, // useResourceUpdater からエラーメッセージを取得
    init, 
    save: executeSave // 名前が衝突しないようにエイリアス
  } = useResourceUpdater<VirtualNetworkResponse>();

  // ID生成用
  let newSubnetCounter = 0;
  const NEW_SUBNET_PREFIX = "new-subnet-";

  /**
   * フォーム初期化
   * ここで API エンドポイントと Bulk 設定を定義します
   */
  const initializeForm = (data: VirtualNetworkResponse) => {
    const resourceId = data.id;

    const config: ResourceConfig = {
      base: {
        // useApiClient は baseURL (/api/) を持っているため、そこからの相対パスを指定
        // ※ useResourceUpdater はデフォルトで PATCH を使用します。
        //   PUT が必須の場合は useResourceUpdater 側でメソッド指定できるように拡張が必要です。
        endpoint: `virtual-networks/${resourceId}`, 
        fields: ["name"],
      },
      collections: {
        subnets: {
          // 個別更新用のエンドポイント (Bulk使用時は使われませんが一応定義)
          endpoint: `virtual-networks/${resourceId}/subnets`, 
          
          // ★★★ ここが重要: Bulk更新用のエンドポイントを指定 ★★★
          // これがあるため、自動的に { create:[], delete:[], patch:[] } の形式でPOSTされます
          bulkEndpoint: `virtual-networks/${resourceId}/subnets/bulk`,
          
          idKey: "id",
          newIdPrefix: NEW_SUBNET_PREFIX,
          fields: ["name", "cidr"],
        },
      },
    };

    init(data, config);
    newSubnetCounter = 0;
  };

  /**
   * サブネット追加
   */
  const addSubnet = () => {
    if (!editedData.value) return;
    if (!editedData.value.subnets) {
      editedData.value.subnets = [];
    }

    // 型安全に追加
    const newSubnet = {
      id: `${NEW_SUBNET_PREFIX}${newSubnetCounter++}`,
      name: "",
      cidr: "",
      createdAt: new Date().toISOString(),
    };
    editedData.value.subnets.push(newSubnet);
  };

  /**
   * サブネット削除
   */
  const removeSubnet = (index: number) => {
    if (!editedData.value?.subnets) return;
    editedData.value.subnets.splice(index, 1);
  };

  /**
   * 保存処理
   * useResourceUpdater の save を呼び出し、結果に応じて UI を制御します
   */
  const save = async (emit: (event: "success" | "close") => void) => {
    // 実際の保存処理を実行
    const success = await executeSave();

    if (success) {
      addToast({ type: "success", message: "保存しました。" });
      emit("success");
      emit("close");
    } else {
      // 失敗時は useResourceUpdater が errorMessage に値をセットしています
      addToast({
        type: "error",
        message: "保存に失敗しました。",
        details: errorMessage.value || "不明なエラーが発生しました。",
      });
    }
  };

  return {
    editedData,
    isSaving,
    updaterError: errorMessage, // テンプレート側が updaterError を参照している場合は合わせる
    initializeForm,
    addSubnet,
    removeSubnet,
    save,
  };
};