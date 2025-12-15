import { ref } from "vue";
import { useToast } from "~/composables/useToast";
import {
  useResourceUpdater,
  type ResourceConfig,
} from "~/composables/useResourceUpdater";

export const useVirtualNetworkEditForm = () => {
  // useToast から addToast を取得
  const { addToast } = useToast();

  // リソース更新用コンポーザブルの初期化
  // 返り値にヘルパー関数が含まれていないため、editedDataなどを取得
  const { editedData, dirtyState, isSaving, init } =
    useResourceUpdater<VirtualNetworkResponse>();

  // 独自のエラー管理
  const updaterError = ref<string | null>(null);

  // 新規サブネット用の一時IDカウンタ
  let newSubnetCounter = 0;
  const NEW_SUBNET_PREFIX = "new-subnet-";

  /**
   * フォーム初期化
   */
  const initializeForm = (data: VirtualNetworkResponse) => {
    const config: ResourceConfig = {
      base: {
        //useResourceUpdaterの自動送信機能は利用せず、手動でAPIを呼び出すため空文字を設定
        endpoint: "",
        fields: ["name"], // 更新可能なフィールド
      },
      collections: {
        subnets: {
          endpoint: "", // 手動処理するため空文字
          idKey: "id",
          newIdPrefix: NEW_SUBNET_PREFIX,
          fields: ["name", "cidr"],
        },
      },
    };
    init(data, config);
    updaterError.value = null;
    newSubnetCounter = 0;
  };

  // ----------------------------------------------------------------
  // サブネット操作 (editedDataを直接操作)
  // ----------------------------------------------------------------
  const addSubnet = () => {
    if (!editedData.value) return;

    // 配列が未定義なら初期化
    if (!editedData.value.subnets) {
      editedData.value.subnets = [];
    }

    // 直接 push する
    editedData.value.subnets.push({
      id: `${NEW_SUBNET_PREFIX}${newSubnetCounter++}`,
      name: "",
      cidr: "",
      // 型定義に合わせて必要なプロパティがあれば初期値を追加
    } as any);
  };

  const removeSubnet = (index: number) => {
    if (!editedData.value?.subnets) return;
    // 直接 splice する (useResourceUpdaterが変更を検知してdirtyStateを更新します)
    editedData.value.subnets.splice(index, 1);
  };

  // ----------------------------------------------------------------
  // 保存処理 (手動実装: API分割対応)
  // ----------------------------------------------------------------
  const save = async (emit: (event: "success" | "close") => void) => {
    if (!editedData.value) return;

    isSaving.value = true;
    updaterError.value = null;

    try {
      const resourceId = editedData.value.id;
      const promises: Promise<any>[] = [];
      let hasChanges = false;

      // 1. 本体 (Base) の差分 -> PATCH /api/virtual-networks/{id}
      const baseDiff = dirtyState.value.base;
      if (Object.keys(baseDiff).length > 0) {
        hasChanges = true;
        // [必須]: 本体更新は API クライアント仕様に合わせて PUT メソッドを使用
        // '$fetch' はグローバル関数として使用
        promises.push(
          $fetch(`/api/virtual-networks/${resourceId}`, {
            method: "PUT",
            body: baseDiff, // { name: "..." }
          })
        );
      }

      // 2. サブネット (Collection) の差分
      const subnetDiff = dirtyState.value.collections.subnets;
      if (
        subnetDiff &&
        (subnetDiff.added.length > 0 ||
          subnetDiff.removed.length > 0 ||
          subnetDiff.updated.length > 0)
      ) {
        hasChanges = true;

        const bulkPayload = {
          create: subnetDiff.added.map((item) => ({
            name: item.name,
            cidr: item.cidr,
          })),
          delete: subnetDiff.removed,
          // 更新は patch
          patch: subnetDiff.updated.map((item) => ({
            id: item.id,
            data: item.payload,
          })),
        };

        // [必須]: サブネット一括更新は API クライアント仕様に合わせて POST メソッドで送信
        promises.push(
          $fetch(`/api/virtual-networks/${resourceId}/subnets/bulk`, {
            method: "POST",
            body: bulkPayload,
          })
        );
      }

      // 変更がない場合
      if (!hasChanges) {
        addToast({ type: "info", message: "変更はありません。" });
        isSaving.value = false;
        return;
      }

      // 並列実行
      await Promise.all(promises);

      addToast({ type: "success", message: "保存しました。" });
      emit("success");
      emit("close");
    } catch (err: any) {
      console.error(err);
      // エラーメッセージの抽出
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
    addSubnet,
    removeSubnet,
    save,
  };
};
