import { f as formatDateTime } from './date-D5dH0cF_.mjs';
import { defineComponent, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderClass } from 'vue/server-renderer';
import { g as getNodeStatusDisplay, a as getVmStatusDisplay } from './status-BiUv1ciD.mjs';
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
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "VmTabBasic",
  __ssrInlineRender: true,
  props: {
    context: {}
  },
  setup(__props) {
    const props = __props;
    const vm = computed(() => props.context);
    const nodeStatus = computed(() => {
      const raw = vm.value?.node?.status ?? "";
      return getNodeStatusDisplay(raw);
    });
    const vmStatus = computed(() => {
      const raw = vm.value?.status ?? "";
      return getVmStatusDisplay(raw);
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-4" }, _attrs))}><h2 class="text-lg font-semibold">基本情報</h2><div class="detail-card"><div><div class="detail-label">名前</div><div class="detail-value">${ssrInterpolate(vm.value?.name || "-")}</div></div><div><div class="detail-label">作成日時</div><div class="detail-value">${ssrInterpolate(("formatDateTime" in _ctx ? _ctx.formatDateTime : unref(formatDateTime))(vm.value?.createdAt))}</div></div><div class="detail-card-section"><div class="detail-heading-sm">ノード</div><div class="space-y-1"><div><span class="detail-label">名前：</span><span class="detail-value">${ssrInterpolate(vm.value?.node?.name || "-")}</span></div><div><span class="detail-label">IPアドレス：</span><span class="detail-value">${ssrInterpolate(vm.value?.node?.ipAddress || "-")}</span></div><div><span class="detail-label">状態：</span><span class="${ssrRenderClass([nodeStatus.value.class, "detail-pill"])}">${ssrInterpolate(nodeStatus.value.text)}</span></div></div></div><div class="detail-card-section"><div class="detail-label mb-1">ステータス</div><span class="${ssrRenderClass([vmStatus.value.class, "detail-pill"])}">${ssrInterpolate(vmStatus.value.text)}</span></div></div></section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/detail/panels/VirtualMachine/VmTabBasic.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const VmTabBasic = Object.assign(_sfc_main, { __name: "DetailPanelsVirtualMachineVmTabBasic" });

export { VmTabBasic as default };
//# sourceMappingURL=VmTabBasic-CLSeQvDS.mjs.map
