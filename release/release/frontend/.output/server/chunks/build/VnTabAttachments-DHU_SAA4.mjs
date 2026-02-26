import { _ as __nuxt_component_0 } from './nuxt-link-JOJF6QkV.mjs';
import { defineComponent, ref, computed, mergeProps, withCtx, unref, createVNode, toDisplayString, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList, ssrRenderComponent, ssrRenderClass } from 'vue/server-renderer';
import { f as formatDateTime } from './date-D5dH0cF_.mjs';
import { a as getVmStatusDisplay } from './status-BiUv1ciD.mjs';
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
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "VnTabAttachments",
  __ssrInlineRender: true,
  props: {
    context: {}
  },
  setup(__props) {
    const loading = ref(false);
    const error = ref(null);
    const attachments = ref([]);
    const hasData = computed(() => attachments.value.length > 0);
    const subnetGroups = computed(() => {
      const map = /* @__PURE__ */ new Map();
      for (const vm of attachments.value) {
        if (!map.has(vm.subnetId)) {
          map.set(vm.subnetId, {
            subnetId: vm.subnetId,
            subnetName: vm.subnetName,
            cidr: vm.cidr,
            vms: []
          });
        }
        map.get(vm.subnetId).vms.push(vm);
      }
      return Array.from(map.values());
    });
    const statusDisplay = (status) => getVmStatusDisplay(status);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-4" }, _attrs))}><h2 class="text-lg font-semibold">接続リソース</h2><div class="rounded-lg border border-neutral-200 bg-white p-4 space-y-4">`);
      if (loading.value) {
        _push(`<p class="text-sm text-neutral-500"> 接続されているリソースを取得しています… </p>`);
      } else if (error.value) {
        _push(`<p class="text-sm text-red-500"> 接続リソースの取得に失敗しました： ${ssrInterpolate(error.value.message || error.value.statusMessage || error.value)}</p>`);
      } else if (hasData.value) {
        _push(`<div class="space-y-6"><!--[-->`);
        ssrRenderList(subnetGroups.value, (group) => {
          _push(`<div class="space-y-3"><div><div class="text-xs text-neutral-500">サブネット</div><div class="text-sm text-neutral-900 font-medium">${ssrInterpolate(group.subnetName || "（名称未設定）")} <span class="ml-2 font-mono text-xs text-neutral-600"> (${ssrInterpolate(group.cidr || "CIDR 未設定")}) </span></div></div><div class="space-y-2"><!--[-->`);
          ssrRenderList(group.vms, (vm) => {
            _push(ssrRenderComponent(_component_NuxtLink, {
              key: vm.id,
              to: `/machine/${vm.id}`,
              class: "block rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm hover:border-indigo-300 hover:shadow-sm transition"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`<div class="flex items-center justify-between"${_scopeId}><div class="font-medium text-neutral-900"${_scopeId}>${ssrInterpolate(vm.name)}</div><span class="${ssrRenderClass([statusDisplay(vm.status).class, "text-xs px-2 py-0.5 rounded-full"])}"${_scopeId}>${ssrInterpolate(statusDisplay(vm.status).text)}</span></div><div class="text-xs text-neutral-600"${_scopeId}> ノード： <span class="font-medium text-neutral-900"${_scopeId}>${ssrInterpolate(vm.nodeName || "—")}</span></div><div class="text-xs text-neutral-600"${_scopeId}> IPアドレス： <span class="font-mono"${_scopeId}>${ssrInterpolate(vm.ipAddress || "—")}</span></div><div class="text-xs text-neutral-600"${_scopeId}> 作成日時： <span${_scopeId}>${ssrInterpolate(unref(formatDateTime)(vm.createdAt))}</span></div>`);
                } else {
                  return [
                    createVNode("div", { class: "flex items-center justify-between" }, [
                      createVNode("div", { class: "font-medium text-neutral-900" }, toDisplayString(vm.name), 1),
                      createVNode("span", {
                        class: ["text-xs px-2 py-0.5 rounded-full", statusDisplay(vm.status).class]
                      }, toDisplayString(statusDisplay(vm.status).text), 3)
                    ]),
                    createVNode("div", { class: "text-xs text-neutral-600" }, [
                      createTextVNode(" ノード： "),
                      createVNode("span", { class: "font-medium text-neutral-900" }, toDisplayString(vm.nodeName || "—"), 1)
                    ]),
                    createVNode("div", { class: "text-xs text-neutral-600" }, [
                      createTextVNode(" IPアドレス： "),
                      createVNode("span", { class: "font-mono" }, toDisplayString(vm.ipAddress || "—"), 1)
                    ]),
                    createVNode("div", { class: "text-xs text-neutral-600" }, [
                      createTextVNode(" 作成日時： "),
                      createVNode("span", null, toDisplayString(unref(formatDateTime)(vm.createdAt)), 1)
                    ])
                  ];
                }
              }),
              _: 2
            }, _parent));
          });
          _push(`<!--]--></div><hr class="border-neutral-200"></div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<p class="text-sm text-neutral-500"> 接続されているリソースはありません。 </p>`);
      }
      _push(`</div></section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/detail/panels/VirtualNetwork/VnTabAttachments.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const VnTabAttachments = Object.assign(_sfc_main, { __name: "DetailPanelsVirtualNetworkVnTabAttachments" });

export { VnTabAttachments as default };
//# sourceMappingURL=VnTabAttachments-DHU_SAA4.mjs.map
