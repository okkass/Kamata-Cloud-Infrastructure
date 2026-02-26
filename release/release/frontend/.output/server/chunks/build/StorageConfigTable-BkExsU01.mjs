import { defineComponent, computed, mergeProps, withCtx, createVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { F as FormInput } from './Input-jfnKbGQs.mjs';
import { F as FormSelect } from './Select-Cb_WFau-.mjs';
import { t as toSize } from './server.mjs';

const getStoragePoolInfo = (pool) => {
  const availableSize = pool.availableSize;
  const usagePercent = pool.totalSize > 0 ? Math.round(pool.usedSize / pool.totalSize * 100) : 0;
  return {
    availableSize,
    usagePercent,
    availableSizeFormatted: formatStorageSize(availableSize),
    totalSizeFormatted: formatStorageSize(pool.totalSize),
    usedSizeFormatted: formatStorageSize(pool.usedSize)
  };
};
const formatStorageSize = (bytes) => {
  return toSize(bytes);
};
const getStoragePoolTitle = (pool) => {
  const info = getStoragePoolInfo(pool);
  return `総容量: ${info.totalSizeFormatted} | 使用中: ${info.usedSizeFormatted} | 空き: ${info.availableSizeFormatted} (${info.usagePercent}% 使用中)`;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "StorageConfigTable",
  __ssrInlineRender: true,
  props: {
    storages: {},
    storagePools: {},
    errors: {}
  },
  emits: ["add", "remove"],
  setup(__props) {
    const props = __props;
    const isNewStorage = (storage) => {
      return typeof storage.id === "string" && storage.id.startsWith("new-");
    };
    const isBackupStorage = (storage) => {
      return "type" in storage && storage.type === "backup";
    };
    const poolDisplayOptions = computed(() => {
      return props.storagePools.map((pool) => {
        const poolInfo = getStoragePoolInfo(pool);
        return {
          id: pool.id,
          displayName: pool.name,
          available: poolInfo.availableSizeFormatted,
          total: poolInfo.totalSizeFormatted,
          usage: poolInfo.usagePercent
        };
      });
    });
    const selectedPoolInfo = (poolId) => {
      const pool = props.storagePools.find((p) => p.id === poolId);
      return pool ? getStoragePoolInfo(pool) : null;
    };
    const selectedPoolName = (poolId) => {
      return props.storagePools.find((p) => p.id === poolId)?.name ?? "";
    };
    const getPoolSelectTitle = (poolId) => {
      if (!poolId) return "";
      const pool = props.storagePools.find((p) => p.id === poolId);
      return pool ? getStoragePoolTitle(pool) : "";
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "border rounded-md overflow-hidden bg-white" }, _attrs))}><div class="bg-gray-100 px-4 py-2 border-b flex justify-between items-center"><h3 class="font-bold text-sm text-gray-700">ディスク一覧</h3><button type="button" class="text-xs bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-2 py-1 rounded shadow-sm transition-colors"> + 追加 </button></div><div class="p-4">`);
      if (__props.storages.length === 0) {
        _push(`<div class="text-center text-gray-400 py-4 text-sm"> ストレージがありません。 </div>`);
      } else {
        _push(`<div class="space-y-3"><!--[-->`);
        ssrRenderList(__props.storages, (storage, index) => {
          _push(`<div class="border-b border-gray-100 pb-3 last:border-0 last:pb-0"><div class="grid grid-cols-12 gap-3 items-start"><div class="col-span-4">`);
          _push(ssrRenderComponent(FormInput, {
            label: "名前",
            name: `storage-name-${index}`,
            modelValue: storage.name,
            "onUpdate:modelValue": ($event) => storage.name = $event,
            error: __props.errors?.[index]?.name,
            placeholder: "disk-1",
            class: "w-full"
          }, null, _parent));
          _push(`</div><div class="col-span-3">`);
          _push(ssrRenderComponent(FormInput, {
            label: "サイズ (GB)",
            name: `storage-size-${index}`,
            type: "number",
            modelValue: storage.size,
            "onUpdate:modelValue": ($event) => storage.size = $event,
            modelModifiers: { number: true },
            error: __props.errors?.[index]?.size,
            disabled: isBackupStorage(storage) || !isNewStorage(storage),
            title: isBackupStorage(storage) ? "バックアップ元のサイズに固定されています" : !isNewStorage(storage) ? "既存ディスクのサイズは変更できません" : "",
            class: "w-full"
          }, null, _parent));
          _push(`</div><div class="col-span-4">`);
          _push(ssrRenderComponent(FormSelect, {
            label: "保存先プール",
            name: `storage-pool-${index}`,
            modelValue: storage.poolId,
            "onUpdate:modelValue": ($event) => storage.poolId = $event,
            options: poolDisplayOptions.value,
            "option-label": (opt) => opt.displayName,
            "option-value": (opt) => opt.id,
            columns: ["プール名", "空き容量", "総容量", "使用率"],
            "grid-template-columns": "2fr 1fr 1fr 1fr",
            "error-message": __props.errors?.[index]?.poolId,
            placeholder: "プールを選択",
            "placeholder-value": "",
            class: "w-full",
            disabled: !isNewStorage(storage),
            title: getPoolSelectTitle(storage.poolId)
          }, {
            option: withCtx(({ option }, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="grid grid-cols-4 gap-3 w-full text-sm"${_scopeId}><span class="font-medium"${_scopeId}>${ssrInterpolate(option.displayName)}</span><span class="text-gray-600"${_scopeId}>${ssrInterpolate(option.available)}</span><span class="text-gray-600"${_scopeId}>${ssrInterpolate(option.total)}</span><span class="text-gray-600"${_scopeId}>${ssrInterpolate(option.usage)}%</span></div>`);
              } else {
                return [
                  createVNode("div", { class: "grid grid-cols-4 gap-3 w-full text-sm" }, [
                    createVNode("span", { class: "font-medium" }, toDisplayString(option.displayName), 1),
                    createVNode("span", { class: "text-gray-600" }, toDisplayString(option.available), 1),
                    createVNode("span", { class: "text-gray-600" }, toDisplayString(option.total), 1),
                    createVNode("span", { class: "text-gray-600" }, toDisplayString(option.usage) + "%", 1)
                  ])
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</div><div class="col-span-1 flex justify-end"><button type="button" class="text-gray-400 hover:text-red-500 p-1" title="削除"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clip-rule="evenodd"></path></svg></button></div></div>`);
          if (storage.poolId && selectedPoolInfo(storage.poolId)) {
            _push(`<div class="mt-2 ml-0 text-xs text-gray-600"><div class="text-gray-700">${ssrInterpolate(selectedPoolName(storage.poolId))} - 空き: ${ssrInterpolate(selectedPoolInfo(storage.poolId)?.availableSizeFormatted)} / 総容量: ${ssrInterpolate(selectedPoolInfo(storage.poolId)?.totalSizeFormatted)} (${ssrInterpolate(selectedPoolInfo(storage.poolId)?.usagePercent)}% 使用中) </div></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/StorageConfigTable.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const StorageConfigTable = Object.assign(_sfc_main, { __name: "StorageConfigTable" });

export { StorageConfigTable as S };
//# sourceMappingURL=StorageConfigTable-BkExsU01.mjs.map
