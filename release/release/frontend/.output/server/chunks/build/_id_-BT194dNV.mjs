import { defineComponent, withAsyncContext, ref, watch, mergeProps, unref, nextTick, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent } from 'vue/server-renderer';
import { e as INSTANCE_TYPE } from './fetch-kOzZWayB.mjs';
import { R as ResourceDetailShell } from './ResourceDetailShell-BS8fimHs.mjs';
import { M as MoInstanceTypeEdit } from './MoInstanceTypeEdit-B3h2N012.mjs';
import { b as useRoute, d as useRouter } from './server.mjs';
import { u as useResourceDetail } from './useResourceDetail-BPCZWJMv.mjs';
import { c as createPolling } from './polling-9ov9NMoc.mjs';
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
import './SubmitButton-BLZt3uil.mjs';
import './useResourceUpdater-D_YM1lnm.mjs';
import './useResourceClient-CRkQUuKV.mjs';
import 'vee-validate';
import '@vee-validate/zod';
import './instance-type-BB8zzCzi.mjs';
import 'zod';
import './useModalAction-CCl6IdMe.mjs';
import './Input-jfnKbGQs.mjs';
import 'vue-router';

const instanceTypeTabs = [
  {
    label: "基本情報",
    value: "basic",
    loader: () => import('./InstanceTypeBasic-BVMmHhMN.mjs')
  }
];
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[id]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const router = useRouter();
    const {
      data: instanceType,
      pending,
      error,
      refresh
    } = ([__temp, __restore] = withAsyncContext(() => useResourceDetail(
      INSTANCE_TYPE.name,
      route.params.id
    )), __temp = await __temp, __restore(), __temp);
    const goBack = () => {
      router.back();
    };
    const actions = ref([{ label: "編集", value: "edit" }]);
    const isEditOpen = ref(false);
    const editInstanceTypeData = ref(void 0);
    const polling = createPolling(async () => {
      await refresh();
    });
    watch(
      () => isEditOpen.value,
      (open) => {
        if (open) polling.stopPolling();
        else polling.startPolling();
      }
    );
    const openEditModal = async () => {
      if (!instanceType.value) return;
      editInstanceTypeData.value = void 0;
      await nextTick();
      editInstanceTypeData.value = instanceType.value;
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
        console.error("InstanceType再取得に失敗しました", e);
      }
      if (instanceType.value) {
        editInstanceTypeData.value = instanceType.value;
      }
    };
    const handleAction = async (action) => {
      if (action.value === "edit") {
        await openEditModal();
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "mx-auto max-w-6xl px-4 py-6" }, _attrs))}>`);
      if (!unref(instanceType) && unref(pending)) {
        _push(`<div class="text-sm text-neutral-500"> 読み込み中… </div>`);
      } else if (!unref(instanceType) && unref(error)) {
        _push(`<div class="text-sm text-red-500"> エラーが発生しました：${ssrInterpolate(unref(error).message)}</div>`);
      } else {
        _push(ssrRenderComponent(ResourceDetailShell, {
          title: `${unref(INSTANCE_TYPE).label}詳細`,
          subtitle: "Instance Type Information",
          tabs: unref(instanceTypeTabs),
          context: unref(instanceType),
          actions: actions.value,
          onBack: goBack,
          onAction: handleAction
        }, null, _parent));
      }
      _push(ssrRenderComponent(MoInstanceTypeEdit, {
        show: isEditOpen.value,
        "instance-type-data": editInstanceTypeData.value,
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/instance-type/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_id_-BT194dNV.mjs.map
