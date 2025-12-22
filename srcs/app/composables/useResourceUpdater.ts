import { ref, computed } from "vue";

// ==========================================
// 型定義
// ==========================================

export interface CollectionConfig {
  endpoint: string; // 個別更新時のベースURL (例: /subnets)
  bulkEndpoint?: string; // ★ 追加: 一括更新用のURL (例: /subnets/bulk)
  idKey: string;
  newIdPrefix: string;
  fields: string[];
}

export interface ResourceConfig {
  base?: {
    endpoint: string;
    fields: string[];
  };
  collections?: Record<string, CollectionConfig>;
}

type DirtyState = {
  base: Record<string, any>;
  collections: {
    [key: string]: {
      add: any[];
      remove: string[];
      patch: { id: string; payload: any }[];
    };
  };
};

// ==========================================
// Main Composable
// ==========================================
export function useResourceUpdater<T extends { id: string }>() {
  const client = useApiClient();

  // 状態管理
  const originalData = ref<T | null>(null);
  const editedData = ref<T | null>(null);
  const config = ref<ResourceConfig | null>(null);

  const isSaving = ref(false);
  const errorMessage = ref<string | null>(null);

  // 初期化関数
  const init = (original: T, conf: ResourceConfig) => {
    originalData.value = JSON.parse(JSON.stringify(original));
    editedData.value = JSON.parse(JSON.stringify(original));
    config.value = conf;
    errorMessage.value = null;
  };

  // 差分検知 (Computed) - ここは変更なし
  const dirtyState = computed<DirtyState>(() => {
    const state: DirtyState = { base: {}, collections: {} };
    if (!originalData.value || !editedData.value || !config.value) return state;

    // 1. Base (基本情報)
    if (config.value.base) {
      const { fields } = config.value.base;
      fields.forEach((key) => {
        const originalValue = (originalData.value as any)[key];
        const editedValue = (editedData.value as any)[key];
        if (JSON.stringify(originalValue) !== JSON.stringify(editedValue)) {
          state.base[key] = editedValue;
        }
      });
    }

    // 2. Collections (配列)
    if (config.value.collections) {
      Object.entries(config.value.collections).forEach(([key, collConfig]) => {
        const originalList: any[] = (originalData.value as any)[key] || [];
        const editedList: any[] = (editedData.value as any)[key] || [];

        const add: any[] = [];
        const remove: string[] = [];
        const patch: { id: string; payload: any }[] = [];

        // add
        editedList.forEach((item) => {
          const id = item[collConfig.idKey];
          if (String(id).startsWith(collConfig.newIdPrefix)) {
            const { [collConfig.idKey]: _, ...payload } = item;
            add.push(payload);
          }
        });

        // remove & patch
        originalList.forEach((origItem) => {
          const id = origItem[collConfig.idKey];
          const editItem = editedList.find((e) => e[collConfig.idKey] === id);

          if (!editItem) {
            remove.push(String(id));
          } else {
            const updatePayload: any = {};
            let hasChange = false;
            collConfig.fields.forEach((field) => {
              if (
                JSON.stringify(origItem[field]) !==
                JSON.stringify(editItem[field])
              ) {
                updatePayload[field] = editItem[field];
                hasChange = true;
              }
            });
            if (hasChange) {
              patch.push({ id: String(id), payload: updatePayload });
            }
          }
        });

        state.collections[key] = { add, remove, patch };
      });
    }

    return state;
  });

  // 変更検知
  const isDirty = computed(() => {
    const s = dirtyState.value;
    if (Object.keys(s.base).length > 0) return true;
    return Object.values(s.collections).some(
      (c) => c.add.length > 0 || c.remove.length > 0 || c.patch.length > 0
    );
  });

  // 保存処理
  const save = async (): Promise<boolean> => {
    if (!config.value || !isDirty.value) return false;
    isSaving.value = true;
    errorMessage.value = null;

    const state = dirtyState.value;
    const apiRequests: Promise<any>[] = [];

    // 1. Base PATCH
    if (config.value.base && Object.keys(state.base).length > 0) {
      apiRequests.push(client.patch(config.value.base.endpoint, state.base));
    }

    // 2. Collections (Bulk 対応)
    if (config.value.collections) {
      Object.entries(config.value.collections).forEach(([key, collConfig]) => {
        const cState = state.collections[key];
        if (!cState) return;

        // 変更がない場合はスキップ
        const hasCollectionChanges =
          cState.add.length > 0 ||
          cState.remove.length > 0 ||
          cState.patch.length > 0;

        if (!hasCollectionChanges) return;

        // ★ BulkEndpoint が設定されている場合: 一括送信
        if (collConfig.bulkEndpoint) {
          const bulkPayload = {
            create: cState.add,
            remove: cState.remove,
            patch: cState.patch.map((u) => ({
              id: u.id,
              data: u.payload, // サーバー側の期待するキー名に合わせる (ここでは 'data')
            })),
          };

          apiRequests.push(client.post(collConfig.bulkEndpoint, bulkPayload));
        }
        // ★ BulkEndpoint がない場合: 個別送信 (既存ロジック)
        else {
          // POST
          cState.add.forEach((payload) => {
            apiRequests.push(client.post(collConfig.endpoint, payload));
          });
          // REMOVE
          cState.remove.forEach((id) => {
            apiRequests.push(client.del(`${collConfig.endpoint}/${id}`));
          });
          // PATCH
          cState.patch.forEach((u) => {
            apiRequests.push(
              client.patch(`${collConfig.endpoint}/${u.id}`, u.payload)
            );
          });
        }
      });
    }

    try {
      const results = await Promise.allSettled(apiRequests);
      const failed = results.filter((r) => r.status === "rejected");

      if (failed.length > 0) {
        console.error("Save partial failure:", failed);
        errorMessage.value = "一部の保存に失敗しました";
        return false;
      }

      // 成功時: 現在の編集データを正として originalData を更新
      originalData.value = JSON.parse(JSON.stringify(editedData.value));
      return true;
    } catch (e) {
      console.error(e);
      errorMessage.value = "保存中に予期せぬエラーが発生しました";
      return false;
    } finally {
      isSaving.value = false;
    }
  };

  const reset = () => {
    if (originalData.value) {
      editedData.value = JSON.parse(JSON.stringify(originalData.value));
    }
  };

  return {
    editedData,
    init,
    save,
    reset,
    isDirty,
    isSaving,
    errorMessage,
    dirtyState,
  };
}
