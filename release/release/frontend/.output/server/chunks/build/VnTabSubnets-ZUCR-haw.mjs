import { defineComponent, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';
import { f as formatDateTime } from './date-D5dH0cF_.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "VnTabSubnets",
  __ssrInlineRender: true,
  props: {
    context: {}
  },
  setup(__props) {
    const props = __props;
    const subnets = computed(() => props.context?.subnets ?? []);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-4" }, _attrs))}><h2 class="text-lg font-semibold">サブネット</h2><div class="detail-card">`);
      if (subnets.value.length > 0) {
        _push(`<div class="space-y-6"><!--[-->`);
        ssrRenderList(subnets.value, (subnet, index) => {
          _push(`<div class="space-y-3"><div><div class="detail-label">サブネット名</div><div class="detail-value">${ssrInterpolate(subnet.name || "—")}</div></div><div><div class="detail-label">CIDR</div><div class="detail-value font-mono">${ssrInterpolate(subnet.cidr || "—")}</div></div><div><div class="detail-label">作成日時</div><div class="detail-value">${ssrInterpolate(unref(formatDateTime)(subnet.createdAt))}</div></div>`);
          if (subnets.value.length > 1 && index < subnets.value.length - 1) {
            _push(`<hr class="border-neutral-200 pt-2">`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<p class="text-sm text-neutral-500"> サブネットは登録されていません。 </p>`);
      }
      _push(`</div></section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/detail/panels/VirtualNetwork/VnTabSubnets.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const VnTabSubnets = Object.assign(_sfc_main, { __name: "DetailPanelsVirtualNetworkVnTabSubnets" });

export { VnTabSubnets as default };
//# sourceMappingURL=VnTabSubnets-ZUCR-haw.mjs.map
