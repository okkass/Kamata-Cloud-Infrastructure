import { defineComponent, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate } from 'vue/server-renderer';
import { f as formatDateTime } from './date-D5dH0cF_.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "VnTabBasic",
  __ssrInlineRender: true,
  props: {
    context: {}
  },
  setup(__props) {
    const props = __props;
    const vnet = computed(() => props.context);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-4" }, _attrs))}><h2 class="text-lg font-semibold">基本情報</h2><div class="detail-card"><div><div class="detail-label">名前</div><div class="detail-value">${ssrInterpolate(vnet.value.name || "—")}</div></div><div class="detail-card-section"><div class="detail-label">CIDR</div><div class="detail-value font-mono">${ssrInterpolate(vnet.value.cidr || "—")}</div></div><div class="detail-card-section"><div class="detail-label">作成日時</div><div class="detail-value">${ssrInterpolate(unref(formatDateTime)(vnet.value.createdAt))}</div></div></div></section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/detail/panels/VirtualNetwork/VnTabBasic.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const VnTabBasic = Object.assign(_sfc_main, { __name: "DetailPanelsVirtualNetworkVnTabBasic" });

export { VnTabBasic as default };
//# sourceMappingURL=VnTabBasic-TB6uR7A1.mjs.map
