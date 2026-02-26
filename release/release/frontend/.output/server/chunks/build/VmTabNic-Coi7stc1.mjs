import { defineComponent, computed, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "VmTabNic",
  __ssrInlineRender: true,
  props: {
    context: {}
  },
  setup(__props) {
    const props = __props;
    const nics = computed(() => {
      const list = props.context?.networkInterfaces ?? [];
      if (!Array.isArray(list)) return [];
      return list.map((nic) => ({
        id: nic.id,
        subnetId: nic.subnet.id,
        ipAddress: nic.ipAddress,
        macAddress: nic.macAddress
      }));
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-4" }, _attrs))}><h2 class="text-lg font-semibold">ネットワークインターフェース</h2><div class="detail-card space-y-4">`);
      if (nics.value.length > 0) {
        _push(`<div class="space-y-6"><!--[-->`);
        ssrRenderList(nics.value, (nic) => {
          _push(`<div class="space-y-3"><div><div class="detail-label">NIC ID</div><div class="detail-value">${ssrInterpolate(nic.id)}</div></div><div><div class="detail-label">サブネットID</div><div class="detail-value">${ssrInterpolate(nic.subnetId || "—")}</div></div><div><div class="detail-label">IPアドレス</div><div class="detail-value">${ssrInterpolate(nic.ipAddress || "—")}</div></div><div><div class="detail-label">MACアドレス</div><div class="detail-value">${ssrInterpolate(nic.macAddress || "—")}</div></div>`);
          if (nics.value.length > 1) {
            _push(`<hr class="border-neutral-200 pt-2">`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<p class="text-sm text-neutral-500"> ネットワークインターフェースは接続されていません。 </p>`);
      }
      _push(`</div></section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/detail/panels/VirtualMachine/VmTabNic.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const VmTabNic = Object.assign(_sfc_main, { __name: "DetailPanelsVirtualMachineVmTabNic" });

export { VmTabNic as default };
//# sourceMappingURL=VmTabNic-Coi7stc1.mjs.map
