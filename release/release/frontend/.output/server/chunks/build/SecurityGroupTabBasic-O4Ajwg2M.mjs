import { defineComponent, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate } from 'vue/server-renderer';
import { f as formatDateTime } from './date-D5dH0cF_.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "SecurityGroupTabBasic",
  __ssrInlineRender: true,
  props: {
    context: {}
  },
  setup(__props) {
    const props = __props;
    const group = computed(() => props.context);
    const totalRules = computed(() => group.value.rules?.length ?? 0);
    const inboundCount = computed(
      () => group.value.rules?.filter((r) => r.ruleType === "inbound").length ?? 0
    );
    const outboundCount = computed(
      () => group.value.rules?.filter((r) => r.ruleType === "outbound").length ?? 0
    );
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-4" }, _attrs))}><h2 class="text-lg font-semibold">基本情報</h2><div class="detail-card"><div><div class="detail-label">名前</div><div class="detail-value text-base">${ssrInterpolate(group.value.name || "—")}</div></div><div><div class="detail-label">説明</div><div class="detail-value">${ssrInterpolate(group.value.description || "—")}</div></div><div class="detail-card-section detail-grid-2col"><div><div class="detail-heading-sm">作成日時</div><div class="detail-value">${ssrInterpolate(unref(formatDateTime)(group.value.createdAt))}</div></div><div><div class="detail-heading-sm">ルール数</div><div class="detail-value"> 合計 ${ssrInterpolate(totalRules.value)} 件 <span class="ml-2 text-xs text-neutral-500 font-normal"> (In: ${ssrInterpolate(inboundCount.value)} / Out: ${ssrInterpolate(outboundCount.value)}) </span></div></div></div></div></section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/detail/panels/SecurityGroup/SecurityGroupTabBasic.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const SecurityGroupTabBasic = Object.assign(_sfc_main, { __name: "DetailPanelsSecurityGroupTabBasic" });

export { SecurityGroupTabBasic as default };
//# sourceMappingURL=SecurityGroupTabBasic-O4Ajwg2M.mjs.map
