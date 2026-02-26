import { defineComponent, withAsyncContext, ref, watch, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent } from 'vue/server-renderer';
import { useRoute, useRouter } from 'vue-router';
import { R as ResourceDetailShell } from './ResourceDetailShell-BS8fimHs.mjs';
import { u as useResourceDetail } from './useResourceDetail-BPCZWJMv.mjs';
import { u as useToast } from './server.mjs';
import { M as MoVirtualNetworkEdit } from './MoVirtualNetworkEdit-CbOw2k03.mjs';
import { b as NETWORK } from './fetch-kOzZWayB.mjs';
import { c as createPolling } from './polling-9ov9NMoc.mjs';
import './index-CICjSpIO.mjs';
import './composables-BRf5lMQQ.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
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
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import './asyncData-BDnIU8Sz.mjs';
import 'perfect-debounce';
import './BaseModal-XreF1fHA.mjs';
import './cross-BwfcbiN4.mjs';
import 'vee-validate';
import '@vee-validate/zod';
import './useResourceUpdater-D_YM1lnm.mjs';
import './useResourceClient-CRkQUuKV.mjs';
import './useModalAction-CCl6IdMe.mjs';
import './virtual-network-9nD05ROF.mjs';
import 'zod';
import './Input-jfnKbGQs.mjs';
import './SubmitButton-BLZt3uil.mjs';

const vnTabs = [
  {
    label: "基本情報",
    value: "basic",
    loader: () => import('./VnTabBasic-TB6uR7A1.mjs')
  },
  {
    label: "サブネット",
    value: "subnets",
    loader: () => import('./VnTabSubnets-ZUCR-haw.mjs')
  },
  {
    label: "接続リソース",
    value: "attachments",
    loader: () => import('./VnTabAttachments-DHU_SAA4.mjs')
  }
];
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[id]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useToast();
    const route = useRoute();
    const router = useRouter();
    const { data: vnet, pending, error, refresh } = ([__temp, __restore] = withAsyncContext(() => useResourceDetail(
      NETWORK.name,
      route.params.id
    )), __temp = await __temp, __restore(), __temp);
    const stableVnet = ref(null);
    watch(
      () => vnet.value,
      (val) => {
        if (val) stableVnet.value = val;
      },
      { immediate: true }
    );
    const goBack = () => {
      router.back();
    };
    const actions = ref([{ label: "編集", value: "edit" }]);
    const isEditOpen = ref(false);
    const targetVnet = ref(null);
    const handleAction = (action) => {
      if (!stableVnet.value) return;
      if (action.value === "edit") {
        targetVnet.value = vnet.value;
        isEditOpen.value = true;
      }
    };
    const handleEditClose = () => {
      isEditOpen.value = false;
      targetVnet.value = null;
    };
    const handleEditSuccess = async () => {
      isEditOpen.value = false;
      if (typeof refresh === "function") {
        try {
          await refresh();
        } catch (e) {
          console.error("仮想ネットワーク再取得に失敗しました", e);
        }
      }
    };
    const { startPolling, stopPolling, runOnce } = createPolling(async () => {
      if (typeof refresh === "function") {
        try {
          await refresh();
        } catch (e) {
          console.error("仮想ネットワーク情報の自動更新に失敗しました", e);
        }
      }
    });
    watch(isEditOpen, async (isOpen) => {
      if (isOpen) {
        stopPolling();
      } else {
        await runOnce();
        await new Promise((resolve) => setTimeout(resolve, 100));
        startPolling(5e3);
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "mx-auto max-w-6xl px-4 py-6" }, _attrs))}>`);
      if (unref(pending) && !stableVnet.value) {
        _push(`<div class="text-sm text-neutral-500"> 読み込み中… </div>`);
      } else if (unref(error) && !stableVnet.value) {
        _push(`<div class="text-sm text-red-500"> エラーが発生しました：${ssrInterpolate(unref(error).message)}</div>`);
      } else {
        _push(ssrRenderComponent(ResourceDetailShell, {
          title: "仮想ネットワーク詳細",
          subtitle: "Virtual Network Information",
          tabs: unref(vnTabs),
          context: stableVnet.value,
          actions: actions.value,
          onBack: goBack,
          onAction: handleAction
        }, null, _parent));
      }
      if (stableVnet.value) {
        _push(ssrRenderComponent(MoVirtualNetworkEdit, {
          show: isEditOpen.value,
          networkData: targetVnet.value,
          onClose: handleEditClose,
          onSuccess: handleEditSuccess
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/network/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_id_-BMqiygpR.mjs.map
