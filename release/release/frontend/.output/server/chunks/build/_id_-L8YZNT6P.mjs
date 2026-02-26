import { defineComponent, withAsyncContext, ref, mergeProps, unref, nextTick, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent } from 'vue/server-renderer';
import { I as IMAGE } from './fetch-kOzZWayB.mjs';
import { R as ResourceDetailShell } from './ResourceDetailShell-BS8fimHs.mjs';
import { M as MoImageEdit } from './MoImageEdit-WbfvqdTK.mjs';
import { u as useToast, b as useRoute, d as useRouter } from './server.mjs';
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
import 'vee-validate';
import '@vee-validate/zod';
import './useResourceEdit-BDkGI_Ar.mjs';
import './image-SWhs2cAJ.mjs';
import 'zod';
import './useModalAction-CCl6IdMe.mjs';
import './Input-jfnKbGQs.mjs';
import './Textarea-BGnieQ5E.mjs';
import 'vue-router';

const imageTabs = [
  {
    label: "基本情報",
    value: "basic",
    loader: () => import('./ImageTabBasic-CLI_r1hM.mjs')
  }
];
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[id]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { addToast } = useToast();
    const route = useRoute();
    const router = useRouter();
    const {
      data: image,
      pending,
      error,
      refresh
    } = ([__temp, __restore] = withAsyncContext(() => useResourceDetail(
      IMAGE.name,
      route.params.id
    )), __temp = await __temp, __restore(), __temp);
    createPolling(async () => {
      await refresh();
    });
    const goBack = () => {
      router.back();
    };
    const actions = ref([{ label: "編集", value: "edit" }]);
    const isEditOpen = ref(false);
    const editImageData = ref(null);
    const openEditModal = async () => {
      if (!image.value) return;
      editImageData.value = null;
      await nextTick();
      editImageData.value = image.value;
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
        console.error("Image再取得に失敗しました", e);
        addToast({ message: "再取得に失敗しました", type: "error" });
      }
      if (image.value) {
        editImageData.value = image.value;
      }
    };
    const handleAction = async (action) => {
      if (!image.value) return;
      if (action.value === "edit") {
        await openEditModal();
        return;
      }
      addToast({
        message: `未対応のアクションです: ${action.label}`,
        type: "error"
      });
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "mx-auto max-w-6xl px-4 py-6" }, _attrs))}>`);
      if (!unref(image) && unref(pending)) {
        _push(`<div class="text-sm text-neutral-500"> 読み込み中… </div>`);
      } else if (!unref(image) && unref(error)) {
        _push(`<div class="text-sm text-red-500"> エラーが発生しました：${ssrInterpolate(unref(error).message)}</div>`);
      } else {
        _push(ssrRenderComponent(ResourceDetailShell, {
          title: "イメージ詳細",
          subtitle: "Image Information",
          tabs: unref(imageTabs),
          context: unref(image),
          actions: unref(actions),
          onBack: goBack,
          onAction: handleAction
        }, null, _parent));
      }
      _push(ssrRenderComponent(MoImageEdit, {
        show: unref(isEditOpen),
        data: unref(editImageData),
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/image/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_id_-L8YZNT6P.mjs.map
