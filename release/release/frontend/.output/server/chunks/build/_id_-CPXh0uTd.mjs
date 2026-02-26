import { defineComponent, withAsyncContext, ref, watch, mergeProps, unref, nextTick, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent } from 'vue/server-renderer';
import { useRoute, useRouter } from 'vue-router';
import { R as ResourceDetailShell } from './ResourceDetailShell-BS8fimHs.mjs';
import { u as useResourceDetail } from './useResourceDetail-BPCZWJMv.mjs';
import { g as SECURITY_GROUP } from './fetch-kOzZWayB.mjs';
import { _ as __nuxt_component_4 } from './MoSecurityGroupEdit-DSXzzQ8a.mjs';
import { c as createPolling } from './polling-9ov9NMoc.mjs';
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
import '@vee-validate/zod';
import './useResourceUpdater-D_YM1lnm.mjs';
import './useResourceClient-CRkQUuKV.mjs';
import './useModalAction-CCl6IdMe.mjs';
import './RuleTable-DJ0ZiAQN.mjs';
import 'zod';
import './Input-jfnKbGQs.mjs';
import './Select-Cb_WFau-.mjs';
import './Textarea-BGnieQ5E.mjs';

const securityGroupTabs = [
  {
    label: "基本情報",
    value: "basic",
    loader: () => import('./SecurityGroupTabBasic-O4Ajwg2M.mjs')
  },
  {
    label: "ルール一覧",
    value: "rules",
    loader: () => import('./SecurityGroupTabRules-BiNrX9Ao.mjs')
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
      data: securityGroup,
      pending,
      error,
      refresh
    } = ([__temp, __restore] = withAsyncContext(() => useResourceDetail(
      SECURITY_GROUP.name,
      // "security-groups"
      route.params.id
    )), __temp = await __temp, __restore(), __temp);
    const polling = createPolling(async () => {
      try {
        await refresh();
      } catch (e) {
        console.error("SecurityGroupの再取得に失敗しました", e);
      }
    });
    const goBack = () => {
      router.back();
    };
    const actions = ref([{ label: "編集", value: "edit" }]);
    const isEditOpen = ref(false);
    const editKey = ref(0);
    const editSecurityGroupData = ref(null);
    const openEditModal = async () => {
      if (!securityGroup.value) return;
      editKey.value += 1;
      editSecurityGroupData.value = null;
      await nextTick();
      editSecurityGroupData.value = securityGroup.value;
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
        console.error("SecurityGroup再取得に失敗しました", e);
      }
      if (securityGroup.value) {
        editSecurityGroupData.value = securityGroup.value;
      }
    };
    watch(
      () => isEditOpen.value,
      (open) => {
        if (open) polling.stopPolling();
        else polling.startPolling();
      }
    );
    const handleAction = async (action) => {
      if (action.value === "edit") {
        await openEditModal();
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "mx-auto max-w-6xl px-4 py-6" }, _attrs))}>`);
      if (!unref(securityGroup) && unref(pending)) {
        _push(`<div class="text-sm text-neutral-500"> 読み込み中… </div>`);
      } else if (!unref(securityGroup) && unref(error)) {
        _push(`<div class="text-sm text-red-500"> エラーが発生しました：${ssrInterpolate(unref(error).message)}</div>`);
      } else {
        _push(ssrRenderComponent(ResourceDetailShell, {
          title: "セキュリティグループ詳細",
          subtitle: "Security Group Information",
          tabs: unref(securityGroupTabs),
          context: unref(securityGroup),
          actions: actions.value,
          onBack: goBack,
          onAction: handleAction
        }, null, _parent));
      }
      if (isEditOpen.value && unref(securityGroup)) {
        _push(ssrRenderComponent(__nuxt_component_4, {
          key: editKey.value,
          show: true,
          data: unref(securityGroup),
          "security-group-data": unref(securityGroup),
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/security-group/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_id_-CPXh0uTd.mjs.map
