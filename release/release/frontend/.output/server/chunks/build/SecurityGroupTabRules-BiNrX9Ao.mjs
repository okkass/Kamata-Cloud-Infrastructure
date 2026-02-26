import { defineComponent, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrInterpolate, ssrRenderClass } from 'vue/server-renderer';
import { f as formatDateTime } from './date-D5dH0cF_.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "SecurityGroupTabRules",
  __ssrInlineRender: true,
  props: {
    context: {}
  },
  setup(__props) {
    const props = __props;
    const rules = computed(() => props.context.rules ?? []);
    const inboundRules = computed(
      () => rules.value.filter((r) => r.ruleType === "inbound")
    );
    const outboundRules = computed(
      () => rules.value.filter((r) => r.ruleType === "outbound")
    );
    const protocolLabel = (p) => {
      switch (p) {
        case "tcp":
          return "TCP";
        case "udp":
          return "UDP";
        case "icmp":
          return "ICMP";
        case "any":
          return "任意";
        default:
          return p;
      }
    };
    const portLabel = (port) => port == null ? "全ポート" : String(port);
    const actionLabel = (a) => a === "deny" ? "拒否" : "許可";
    const actionClass = (a) => a === "deny" ? "bg-rose-50 text-rose-700 border-rose-200" : "detail-pill-yes";
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-4" }, _attrs))}><h2 class="text-lg font-semibold">ルール一覧</h2><div class="detail-card space-y-6"><div><h3 class="mb-2 text-sm font-semibold text-neutral-800"> インバウンドルール </h3>`);
      if (inboundRules.value.length === 0) {
        _push(`<p class="text-sm text-neutral-500"> インバウンドルールは設定されていません。 </p>`);
      } else {
        _push(`<div class="space-y-2"><!--[-->`);
        ssrRenderList(inboundRules.value, (rule) => {
          _push(`<article class="rounded-lg border border-neutral-200 px-4 py-3 bg-white"><div class="flex items-center justify-between gap-3 mb-2"><p class="detail-value">${ssrInterpolate(rule.name || "（名称未設定）")}</p><span class="${ssrRenderClass([actionClass(rule.action), "detail-pill"])}">${ssrInterpolate(actionLabel(rule.action))}</span></div><dl class="grid gap-2 md:grid-cols-3"><div><dt class="detail-label">プロトコル</dt><dd class="detail-value text-xs">${ssrInterpolate(protocolLabel(rule.protocol))}</dd></div><div><dt class="detail-label">ポート</dt><dd class="detail-value text-xs">${ssrInterpolate(portLabel(rule.port))}</dd></div><div><dt class="detail-label">ターゲットIP</dt><dd class="detail-value text-xs font-mono">${ssrInterpolate(rule.targetIp)}</dd></div></dl><p class="mt-2 text-[10px] text-neutral-400 text-right">${ssrInterpolate(unref(formatDateTime)(rule.createdAt))}</p></article>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`</div><div class="detail-card-section pt-4"><h3 class="mb-2 text-sm font-semibold text-neutral-800"> アウトバウンドルール </h3>`);
      if (outboundRules.value.length === 0) {
        _push(`<p class="text-sm text-neutral-500"> アウトバウンドルールは設定されていません。 </p>`);
      } else {
        _push(`<div class="space-y-2"><!--[-->`);
        ssrRenderList(outboundRules.value, (rule) => {
          _push(`<article class="rounded-lg border border-neutral-200 px-4 py-3 bg-white"><div class="flex items-center justify-between gap-3 mb-2"><p class="detail-value">${ssrInterpolate(rule.name || "（名称未設定）")}</p><span class="${ssrRenderClass([actionClass(rule.action), "detail-pill"])}">${ssrInterpolate(actionLabel(rule.action))}</span></div><dl class="grid gap-2 md:grid-cols-3"><div><dt class="detail-label">プロトコル</dt><dd class="detail-value text-xs">${ssrInterpolate(protocolLabel(rule.protocol))}</dd></div><div><dt class="detail-label">ポート</dt><dd class="detail-value text-xs">${ssrInterpolate(portLabel(rule.port))}</dd></div><div><dt class="detail-label">ターゲットIP</dt><dd class="detail-value text-xs font-mono">${ssrInterpolate(rule.targetIp)}</dd></div></dl><p class="mt-2 text-[10px] text-neutral-400 text-right">${ssrInterpolate(unref(formatDateTime)(rule.createdAt))}</p></article>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`</div></div></section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/detail/panels/SecurityGroup/SecurityGroupTabRules.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const SecurityGroupTabRules = Object.assign(_sfc_main, { __name: "DetailPanelsSecurityGroupTabRules" });

export { SecurityGroupTabRules as default };
//# sourceMappingURL=SecurityGroupTabRules-BiNrX9Ao.mjs.map
