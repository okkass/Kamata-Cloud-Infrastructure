import { _ as __nuxt_component_1 } from './cross-BwfcbiN4.mjs';
import { computed, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderClass, ssrRenderSlot } from 'vue/server-renderer';

const _sfc_main = {
  __name: "BaseModal",
  __ssrInlineRender: true,
  props: {
    show: { type: Boolean, required: true },
    title: { type: String, default: "モーダル" },
    size: { type: String, default: "md" }
  },
  emits: ["close"],
  setup(__props) {
    const props = __props;
    const modalBodyClass = computed(() => {
      switch (props.size) {
        case "lg":
          return "h-[600px]";
        case "md":
          return "h-[450px]";
        default:
          return "";
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_IconCross = __nuxt_component_1;
      if (__props.show) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" }, _attrs))}><div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh]"><div class="flex-shrink-0 flex justify-between items-center border-b border-gray-200 pb-4 mb-4"><h2 class="text-xl font-bold text-gray-800">${ssrInterpolate(__props.title)}</h2><button class="text-3xl text-gray-500 hover:text-gray-800">`);
        _push(ssrRenderComponent(_component_IconCross, null, null, _parent));
        _push(`</button></div><div class="${ssrRenderClass([modalBodyClass.value, "modal-body overflow-y-auto p-3"])}">`);
        ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
        _push(`</div>`);
        ssrRenderSlot(_ctx.$slots, "footer", {}, null, _push, _parent);
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/BaseModal.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=BaseModal-XreF1fHA.mjs.map
