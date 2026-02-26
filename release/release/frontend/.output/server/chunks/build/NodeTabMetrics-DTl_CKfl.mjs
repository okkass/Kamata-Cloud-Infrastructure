import { f as formatAsPercent } from './status-BiUv1ciD.mjs';
import { defineComponent, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate } from 'vue/server-renderer';
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
  __name: "NodeTabMetrics",
  __ssrInlineRender: true,
  props: {
    context: {}
  },
  setup(__props) {
    const props = __props;
    const node = computed(() => props.context);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-4" }, _attrs))}><h2 class="text-lg font-semibold">リソース使用率</h2><div class="detail-card space-y-3"><div><div class="detail-label">CPU使用率</div><div class="detail-value">${ssrInterpolate(("formatAsPercent" in _ctx ? _ctx.formatAsPercent : unref(formatAsPercent))(node.value?.cpuUtilization))}</div></div><div><div class="detail-label">メモリ使用率</div><div class="detail-value">${ssrInterpolate(("formatAsPercent" in _ctx ? _ctx.formatAsPercent : unref(formatAsPercent))(node.value?.memoryUtilization))}</div></div><div><div class="detail-label">ストレージ使用率</div><div class="detail-value">${ssrInterpolate(("formatAsPercent" in _ctx ? _ctx.formatAsPercent : unref(formatAsPercent))(node.value?.storageUtilization))}</div></div></div></section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/detail/panels/Node/NodeTabMetrics.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const NodeTabMetrics = Object.assign(_sfc_main, { __name: "DetailPanelsNodeTabMetrics" });

export { NodeTabMetrics as default };
//# sourceMappingURL=NodeTabMetrics-DTl_CKfl.mjs.map
