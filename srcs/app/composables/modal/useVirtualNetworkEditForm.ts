/**
 * =================================================================================
 * 仮想ネットワーク編集フォーム Composable (useVirtualNetworkEditForm.ts)
 * =================================================================================
 */
import { ref, computed } from "vue";
import { useToast } from "~/composables/useToast";
import { useResourceUpdater } from "~/composables/useResourceUpdater";

// 型定義は自動インポート前提
// VirtualNetworkResponse, VirtualNetworkPatchRequest, SubnetResponse など

export function useVirtualNetworkEditForm() {
  const { addToast } = useToast();

  // 差分検知ロジック (useResourceUpdater)
  const {
    init,
    editedData,
    dirtyState,
    isSaving,
    errorMessage: updaterError,
  } = useResourceUpdater<VirtualNetworkResponse>();

  // サブネットの新規ID採番用プレフィックス
  const NEW_SUBNET_PREFIX = "new-subnet-";
  let newSubnetCounter = 0;

  /**
   * フォームの初期化
   * @param originData 編集対象の仮想ネットワークデータ
   */
  const initializeForm = (originData: VirtualNetworkResponse) => {
    init(originData, {
      // 仮想ネットワーク本体の監視設定
      base: {
        endpoint: "", // 今回は一括送信するためエンドポイントは使用しませんが設定上記述
        fields: ["name"], // 変更検知するフィールド
      },
      // サブネット配列の監視設定
      collections: {
        subnets: {
          endpoint: "",
          idKey: "id",
          newIdPrefix: NEW_SUBNET_PREFIX, // 新規追加分のIDルール
          fields: ["name", "cidr"], // サブネットで変更検知するフィールド
        },
      },
    });
  };

  /**
   * サブネットの追加
   */
  const addSubnet = () => {
    if (!editedData.value) return;

    // サブネット配列が存在しない場合は初期化
    if (!editedData.value.subnets) {
      editedData.value.subnets = [];
    }

    // 新規行を追加 (IDは一時的なもの)
    editedData.value.subnets.push({
      id: `${NEW_SUBNET_PREFIX}${newSubnetCounter++}`,
      name: "",
      cidr: "",
      // API型定義に合わせて必要なプロパティがあれば初期値を追加
    } as any);
  };

  /**
   * サブネットの削除
   * @param index 配列のインデックス
   */
  const removeSubnet = (index: number) => {
    if (!editedData.value?.subnets) return;
    editedData.value.subnets.splice(index, 1);
  };

  /**
   * 保存実行 (一括 PATCH 送信)
   */
  const save = async (emit: (event: "success" | "close") => void) => {
    if (!editedData.value) return;

    isSaving.value = true;
    updaterError.value = null;

    try {
      // 1. ペイロードの構築
      //subnets を入れるため、一時的に any (または Record<string, any>) として扱います
      const payload: any = {};

      let hasChanges = false;

      // (A) 本体 (Base) の差分
      const baseDiff = dirtyState.value.base;
      if (Object.keys(baseDiff).length > 0) {
        Object.assign(payload, baseDiff);
        hasChanges = true;
      }

      // (B) サブネット (Collection) の差分 -> BulkRequest形式に変換
      const subnetDiff = dirtyState.value.collections.subnets;
      if (
        subnetDiff &&
        (subnetDiff.added.length > 0 ||
          subnetDiff.removed.length > 0 ||
          subnetDiff.updated.length > 0)
      ) {
        // payload は any なので、subnets プロパティを追加してもエラーになりません
        payload.subnets = {
          add: subnetDiff.added.map((item) => ({
            name: item.name,
            cidr: item.cidr,
          })),
          delete: subnetDiff.removed,
          patch: subnetDiff.updated.map((item) => ({
            id: item.id,
            data: item.payload,
          })),
        };
        hasChanges = true;
      }

      // 変更がない場合
      if (!hasChanges) {
        addToast({ type: "info", message: "変更はありません。" });
        isSaving.value = false;
        return;
      }

      // 2. API送信 (PATCH /api/virtual-networks/{id})
      // useResourceUpdaterのsave機能は使わず、自前でPATCHを1回送る
      const resourceId = editedData.value.id;

      // ※ $fetch や useFetch を使用 (環境に合わせてパス調整)
      await $fetch(`/api/virtual-networks/${resourceId}`, {
        method: "PUT",
        body: payload,
      });

      addToast({
        type: "success",
        message: "仮想ネットワークを更新しました。",
      });
      emit("success");
    } catch (err: any) {
      console.error(err);
      updaterError.value = "保存中にエラーが発生しました。";
      addToast({
        type: "error",
        message: "保存に失敗しました。",
        details: err.message,
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
    addSubnet,
    removeSubnet,
    save,
  };
}
