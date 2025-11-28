import { ref, computed, type Ref } from "vue";

// ==========================================
// 型定義
// ==========================================

export interface CollectionConfig {
  endpoint: string;
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
      added: any[];
      removed: string[];
      updated: { id: string; payload: any }[];
    };
  };
};

// ==========================================
// Main Composable
// ==========================================
export function useResourceUpdater<T extends { id: string }>() {
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

  // 差分検知 (Computed)
  const dirtyState = computed<DirtyState>(() => {
    const state: DirtyState = { base: {}, collections: {} };
    if (!originalData.value || !editedData.value || !config.value) return state;

    // 1. Base (基本情報) の比較
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

    // 2. Collections (配列) の比較
    if (config.value.collections) {
      Object.entries(config.value.collections).forEach(([key, collConfig]) => {
        const originalList: any[] = (originalData.value as any)[key] || [];
        const editedList: any[] = (editedData.value as any)[key] || [];

        const added: any[] = [];
        const removed: string[] = [];
        const updated: { id: string; payload: any }[] = [];

        // Added
        editedList.forEach((item) => {
          const id = item[collConfig.idKey];
          if (String(id).startsWith(collConfig.newIdPrefix)) {
            const { [collConfig.idKey]: _, ...payload } = item;
            added.push(payload);
          }
        });

        // Removed & Updated
        originalList.forEach((origItem) => {
          const id = origItem[collConfig.idKey];
          const editItem = editedList.find((e) => e[collConfig.idKey] === id);

          if (!editItem) {
            removed.push(String(id));
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
              updated.push({ id: String(id), payload: updatePayload });
            }
          }
        });

        state.collections[key] = { added, removed, updated };
      });
    }

    return state;
  });

  // 変更があるかどうか
  const isDirty = computed(() => {
    const s = dirtyState.value;
    if (Object.keys(s.base).length > 0) return true;
    return Object.values(s.collections).some(
      (c) => c.added.length > 0 || c.removed.length > 0 || c.updated.length > 0
    );
  });

  // 保存処理
  const save = async (): Promise<boolean> => {
    if (!config.value || !isDirty.value) return false;
    isSaving.value = true;
    errorMessage.value = null;

    const state = dirtyState.value;
    const apiRequests: Promise<any>[] = [];

    // Base PATCH
    if (config.value.base && Object.keys(state.base).length > 0) {
      apiRequests.push(
        $fetch(config.value.base.endpoint, {
          method: "PATCH",
          body: state.base,
        })
      );
    }

    // Collections
    if (config.value.collections) {
      Object.entries(config.value.collections).forEach(([key, collConfig]) => {
        const cState = state.collections[key];
        // POST
        cState.added.forEach((payload) => {
          apiRequests.push(
            $fetch(collConfig.endpoint, { method: "POST", body: payload })
          );
        });
        // DELETE
        cState.removed.forEach((id) => {
          apiRequests.push(
            $fetch(`${collConfig.endpoint}/${id}`, { method: "DELETE" })
          );
        });
        // PATCH
        cState.updated.forEach((u) => {
          apiRequests.push(
            $fetch(`${collConfig.endpoint}/${u.id}`, {
              method: "PATCH",
              body: u.payload,
            })
          );
        });
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
      originalData.value = JSON.parse(JSON.stringify(editedData.value));
      return true;
    } catch (e) {
      console.error(e);
      errorMessage.value = "保存中にエラーが発生しました";
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
    editedData, // ★ これが必要です
    init,
    save,
    reset,
    isDirty,
    isSaving,
    errorMessage,
    dirtyState,
  };
}
