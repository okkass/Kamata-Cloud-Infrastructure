import { defineComponent, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { c as convertByteToUnit } from './server.mjs';
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
  __name: "VmTabSpec",
  __ssrInlineRender: true,
  props: {
    context: {}
  },
  setup(__props) {
    const props = __props;
    const vm = computed(() => props.context);
    const cpuDisplay = computed(() => {
      const cores = vm.value?.cpuCore;
      return typeof cores === "number" ? cores : "—";
    });
    const memoryDisplay = computed(() => {
      const bytes = vm.value?.memorySize;
      if (typeof bytes !== "number" || !Number.isFinite(bytes)) return "—";
      return `${convertByteToUnit(bytes, "MB")}MB`;
    });
    const storages = computed(() => {
      const list = vm.value?.storages ?? [];
      if (!Array.isArray(list)) return [];
      return list.map((s) => ({
        id: s.id,
        name: s.name,
        size: s.size,
        poolLabel: s.pool?.name ?? s.pool?.id ?? "—"
      }));
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-4" }, _attrs))}><h2 class="text-lg font-semibold">構成</h2><div class="detail-card space-y-4"><dl class="space-y-3 text-sm"><div><dt class="detail-label">CPUコア</dt><dd class="detail-value">${ssrInterpolate(cpuDisplay.value)}</dd></div><div><dt class="detail-label">メモリサイズ</dt><dd class="detail-value">${ssrInterpolate(memoryDisplay.value)}</dd></div></dl><div class="detail-card-section"><h3 class="text-sm font-semibold text-neutral-700">ストレージ</h3><div class="space-y-2 mt-2"><!--[-->`);
      ssrRenderList(storages.value, (s) => {
        _push(`<article class="rounded-lg border border-neutral-200 px-4 py-3"><p class="text-xs text-neutral-500">${ssrInterpolate(s.name)}</p><p class="text-sm text-neutral-900 font-medium"> サイズ：${ssrInterpolate(unref(convertByteToUnit)(s.size, "GB"))}GB </p><p class="text-sm text-neutral-900 font-medium"> プール: ${ssrInterpolate(s.poolLabel)}</p></article>`);
      });
      _push(`<!--]-->`);
      if (storages.value.length === 0) {
        _push(`<p class="text-sm text-neutral-500"> ストレージは接続されていません。 </p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div></section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/detail/panels/VirtualMachine/VmTabSpec.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const VmTabSpec = Object.assign(_sfc_main, { __name: "DetailPanelsVirtualMachineVmTabSpec" });

export { VmTabSpec as default };
//# sourceMappingURL=VmTabSpec-C7hJ79Lf.mjs.map
