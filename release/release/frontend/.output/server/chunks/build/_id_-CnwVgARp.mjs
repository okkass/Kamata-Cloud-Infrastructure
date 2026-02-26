import { defineComponent, withAsyncContext, ref, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent } from 'vue/server-renderer';
import { useRoute, useRouter } from 'vue-router';
import { R as ResourceDetailShell } from './ResourceDetailShell-BS8fimHs.mjs';
import { u as useResourceDetail } from './useResourceDetail-BPCZWJMv.mjs';
import { U as USER } from './fetch-kOzZWayB.mjs';
import { M as MoUserEdit } from './MoUserEdit-CgkziSP5.mjs';
import './index-CICjSpIO.mjs';
import './server.mjs';
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
import './composables-BRf5lMQQ.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import './asyncData-BDnIU8Sz.mjs';
import 'perfect-debounce';
import './BaseModal-XreF1fHA.mjs';
import './cross-BwfcbiN4.mjs';
import './SubmitButton-BLZt3uil.mjs';
import 'vee-validate';
import './user-BB0TVvYL.mjs';
import 'zod';
import '@vee-validate/zod';
import './useResourceEdit-BDkGI_Ar.mjs';
import './useModalAction-CCl6IdMe.mjs';
import './Input-jfnKbGQs.mjs';
import './Section-B8lyqO8a.mjs';

const userTabs = [
  {
    label: "基本情報",
    value: "basic",
    loader: () => import('./UserTabBasic-BapFvYFw.mjs')
  },
  {
    label: "権限・リソース",
    value: "permissions",
    loader: () => import('./UserTabPermissions-BU6HU8_9.mjs')
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
      data: user,
      pending,
      error,
      refresh
    } = ([__temp, __restore] = withAsyncContext(() => useResourceDetail(USER.name, route.params.id)), __temp = await __temp, __restore(), __temp);
    const goBack = () => router.back();
    const actions = ref([{ label: "編集", value: "edit" }]);
    const isEditOpen = ref(false);
    const handleAction = (action) => {
      if (action.value === "edit") {
        isEditOpen.value = true;
      }
    };
    const handleEditClose = () => {
      isEditOpen.value = false;
    };
    const handleEditSuccess = async () => {
      isEditOpen.value = false;
      if (typeof refresh === "function") {
        try {
          await refresh();
        } catch (e) {
          console.error("利用者情報の再取得に失敗しました", e);
        }
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "detail-container" }, _attrs))}>`);
      if (unref(pending)) {
        _push(`<div class="text-loading">読み込み中…</div>`);
      } else if (unref(error)) {
        _push(`<div class="error-text"> エラーが発生しました：${ssrInterpolate(unref(error).message)}</div>`);
      } else {
        _push(ssrRenderComponent(ResourceDetailShell, {
          title: "利用者詳細",
          subtitle: "User Information",
          tabs: unref(userTabs),
          context: unref(user),
          actions: actions.value,
          onBack: goBack,
          onAction: handleAction
        }, null, _parent));
      }
      if (unref(user)) {
        _push(ssrRenderComponent(MoUserEdit, {
          show: isEditOpen.value,
          data: unref(user),
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/user/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_id_-CnwVgARp.mjs.map
