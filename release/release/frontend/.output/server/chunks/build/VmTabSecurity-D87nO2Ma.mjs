import { defineComponent, computed, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "VmTabSecurity",
  __ssrInlineRender: true,
  props: {
    context: {}
  },
  setup(__props) {
    const props = __props;
    const groups = computed(() => props.context?.securityGroups ?? []);
    function formatDate(value) {
      if (!value) return "-";
      const d = new Date(value);
      if (isNaN(d.getTime())) return value;
      return d.toLocaleString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      });
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-4" }, _attrs))}><h2 class="text-lg font-semibold">セキュリティグループ</h2><div class="detail-card space-y-4">`);
      if (groups.value.length > 0) {
        _push(`<div class="space-y-6"><!--[-->`);
        ssrRenderList(groups.value, (g) => {
          _push(`<div class="space-y-3"><div><div class="detail-label">ID</div><div class="detail-value">${ssrInterpolate(g.id)}</div></div><div><div class="detail-label">名前</div><div class="detail-value">${ssrInterpolate(g.name)}</div></div><div><div class="detail-label">作成日時</div><div class="detail-value">${ssrInterpolate(formatDate(g.createdAt))}</div></div>`);
          if (groups.value.length > 1) {
            _push(`<hr class="border-neutral-200 pt-2">`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<p class="text-sm text-neutral-500"> セキュリティグループは登録されていません。 </p>`);
      }
      _push(`</div></section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/detail/panels/VirtualMachine/VmTabSecurity.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const VmTabSecurity = Object.assign(_sfc_main, { __name: "DetailPanelsVirtualMachineVmTabSecurity" });

export { VmTabSecurity as default };
//# sourceMappingURL=VmTabSecurity-D87nO2Ma.mjs.map
