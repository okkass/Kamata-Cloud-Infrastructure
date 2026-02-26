import { defineComponent, computed, withAsyncContext, ref, watch, mergeProps, unref, nextTick, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent } from 'vue/server-renderer';
import { useRoute, useRouter } from 'vue-router';
import { d as STORAGE } from './fetch-kOzZWayB.mjs';
import { c as createPolling } from './polling-9ov9NMoc.mjs';
import { R as ResourceDetailShell } from './ResourceDetailShell-BS8fimHs.mjs';
import { M as MoStorageEdit } from './MoStorageEdit-DpWdngYi.mjs';
import { u as useResourceDetail } from './useResourceDetail-BPCZWJMv.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '@iconify/utils';
import 'consola';
import './server.mjs';
import './asyncData-BDnIU8Sz.mjs';
import 'perfect-debounce';
import './index-CICjSpIO.mjs';
import './composables-BRf5lMQQ.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import './BaseModal-XreF1fHA.mjs';
import './cross-BwfcbiN4.mjs';
import 'vee-validate';
import '@vee-validate/zod';
import './useResourceUpdater-D_YM1lnm.mjs';
import './useResourceClient-CRkQUuKV.mjs';
import './useModalAction-CCl6IdMe.mjs';
import './storage-mOgjHrQq.mjs';
import 'zod';
import './Input-jfnKbGQs.mjs';
import './Select-Cb_WFau-.mjs';
import './SubmitButton-BLZt3uil.mjs';

const storagePoolTabs = [
  {
    label: "基本情報",
    value: "basic",
    loader: () => import('./StoragePoolTabBasic-CIxwAM-3.mjs')
  },
  {
    label: "物理ノード",
    value: "node",
    loader: () => import('./StoragePoolTabNode-PKFIwJDR.mjs')
  }
];
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[id]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const poolContext = computed(() => {
      return pool.value ?? void 0;
    });
    const route = useRoute();
    const router = useRouter();
    const {
      data: pool,
      pending,
      error,
      refresh
    } = ([__temp, __restore] = withAsyncContext(() => useResourceDetail(
      STORAGE.name,
      route.params.id
    )), __temp = await __temp, __restore(), __temp);
    const polling = createPolling(async () => {
      await refresh();
    });
    const isEditOpen = ref(false);
    watch(
      () => isEditOpen.value,
      (open) => {
        if (open) polling.stopPolling();
        else polling.startPolling();
      }
    );
    const goBack = () => {
      router.back();
    };
    const actions = ref([{ label: "編集", value: "edit" }]);
    const editStorageData = ref(null);
    const openEditModal = async () => {
      if (!pool.value) return;
      editStorageData.value = null;
      await nextTick();
      editStorageData.value = pool.value;
      isEditOpen.value = true;
    };
    const handleEditClose = () => {
      isEditOpen.value = false;
    };
    const handleEditSuccess = async () => {
      isEditOpen.value = false;
      try {
        await refresh();
      } catch (e) {
        console.error("StoragePool再取得に失敗しました", e);
      }
      if (pool.value) {
        editStorageData.value = pool.value;
      }
    };
    const handleAction = async (action) => {
      if (!pool.value) return;
      if (action.value === "edit") {
        await openEditModal();
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "mx-auto max-w-6xl px-4 py-6" }, _attrs))}>`);
      if (!unref(pool) && unref(pending)) {
        _push(`<div class="text-sm text-neutral-500"> 読み込み中… </div>`);
      } else if (!unref(pool) && unref(error)) {
        _push(`<div class="text-sm text-red-500"> エラーが発生しました：${ssrInterpolate(unref(error).message)}</div>`);
      } else {
        _push(ssrRenderComponent(ResourceDetailShell, {
          title: "ストレージプール詳細",
          subtitle: "Storage Pool Information",
          tabs: unref(storagePoolTabs),
          context: poolContext.value,
          actions: actions.value,
          onBack: goBack,
          onAction: handleAction
        }, null, _parent));
      }
      _push(ssrRenderComponent(MoStorageEdit, {
        show: isEditOpen.value,
        "storage-data": editStorageData.value,
        onClose: handleEditClose,
        onSuccess: handleEditSuccess
      }, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/storage-pool/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_id_-CmqYqD6V.mjs.map
