import { ref, computed } from 'vue';
import { u as useApiClient } from './useResourceClient-CRkQUuKV.mjs';

function useResourceUpdater() {
  const client = useApiClient();
  const originalData = ref(null);
  const editedData = ref(null);
  const config = ref(null);
  const isSaving = ref(false);
  const errorMessage = ref(null);
  const init = (original, conf) => {
    originalData.value = JSON.parse(JSON.stringify(original));
    editedData.value = JSON.parse(JSON.stringify(original));
    config.value = conf;
    errorMessage.value = null;
  };
  const dirtyState = computed(() => {
    const state = { base: {}, collections: {} };
    if (!originalData.value || !editedData.value || !config.value) return state;
    if (config.value.base) {
      const { fields } = config.value.base;
      fields.forEach((key) => {
        const originalValue = originalData.value[key];
        const editedValue = editedData.value[key];
        if (JSON.stringify(originalValue) !== JSON.stringify(editedValue)) {
          state.base[key] = editedValue;
        }
      });
    }
    if (config.value.collections) {
      Object.entries(config.value.collections).forEach(([key, collConfig]) => {
        const originalList = originalData.value[key] || [];
        const editedList = editedData.value[key] || [];
        const add = [];
        const remove = [];
        const patch = [];
        editedList.forEach((item) => {
          const id = item[collConfig.idKey];
          const isNew = String(id).startsWith(collConfig.newIdPrefix);
          if (isNew) {
            const { [collConfig.idKey]: _, ...payload } = item;
            add.push(payload);
          }
        });
        originalList.forEach((origItem) => {
          const id = origItem[collConfig.idKey];
          const editItem = editedList.find((e) => e[collConfig.idKey] === id);
          if (!editItem) {
            remove.push(String(id));
          } else {
            const updatePayload = {};
            let hasChange = false;
            collConfig.fields.forEach((field) => {
              if (JSON.stringify(origItem[field]) !== JSON.stringify(editItem[field])) {
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
  const isDirty = computed(() => {
    const s = dirtyState.value;
    if (Object.keys(s.base).length > 0) return true;
    return Object.values(s.collections).some(
      (c) => c.add.length > 0 || c.remove.length > 0 || c.patch.length > 0
    );
  });
  const save = async () => {
    if (!config.value || !isDirty.value) return false;
    isSaving.value = true;
    errorMessage.value = null;
    const state = dirtyState.value;
    const apiRequests = [];
    if (config.value.base && Object.keys(state.base).length > 0) {
      apiRequests.push(client.patch(config.value.base.endpoint, state.base));
    }
    if (config.value.collections) {
      Object.entries(config.value.collections).forEach(([key, collConfig]) => {
        const cState = state.collections[key];
        if (!cState) return;
        const hasCollectionChanges = cState.add.length > 0 || cState.remove.length > 0 || cState.patch.length > 0;
        if (!hasCollectionChanges) return;
        if (collConfig.bulkEndpoint) {
          const bulkPayload = {
            add: cState.add,
            remove: cState.remove,
            patch: cState.patch.map((u) => ({
              id: u.id,
              data: u.payload
              // サーバー側の期待するキー名に合わせる (ここでは 'data')
            }))
          };
          apiRequests.push(client.post(collConfig.bulkEndpoint, bulkPayload));
        } else {
          cState.add.forEach((payload) => {
            apiRequests.push(client.post(collConfig.endpoint, payload));
          });
          cState.remove.forEach((id) => {
            apiRequests.push(client.del(`${collConfig.endpoint}/${id}`));
          });
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
    dirtyState
  };
}

export { useResourceUpdater as u };
//# sourceMappingURL=useResourceUpdater-D_YM1lnm.mjs.map
