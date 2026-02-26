import { defineComponent, computed, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderClass, ssrRenderAttr, ssrInterpolate, ssrRenderSlot } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "BaseAlert",
  __ssrInlineRender: true,
  props: {
    type: { default: "info" },
    title: { default: "" }
  },
  setup(__props) {
    const props = __props;
    const styles = {
      info: {
        bg: "bg-blue-50",
        border: "border-blue-400",
        icon: "text-blue-400",
        title: "text-blue-800",
        text: "text-blue-700"
      },
      warning: {
        bg: "bg-yellow-50",
        border: "border-yellow-400",
        icon: "text-yellow-400",
        title: "text-yellow-800",
        text: "text-yellow-700"
      },
      error: {
        bg: "bg-red-50",
        border: "border-red-400",
        icon: "text-red-400",
        title: "text-red-800",
        text: "text-red-700"
      },
      success: {
        bg: "bg-green-50",
        border: "border-green-400",
        icon: "text-green-400",
        title: "text-green-800",
        text: "text-green-700"
      }
    };
    const iconPaths = {
      info: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z",
      warning: "M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z",
      error: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z",
      success: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
    };
    const style = computed(() => styles[props.type]);
    const iconPath = computed(() => iconPaths[props.type]);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: [style.value.bg, "border-l-4 p-4", style.value.border]
      }, _attrs))}><div class="flex"><div class="flex-shrink-0"><svg class="${ssrRenderClass([style.value.icon, "h-5 w-5"])}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd"${ssrRenderAttr("d", iconPath.value)} clip-rule="evenodd"></path></svg></div><div class="ml-3">`);
      if (__props.title) {
        _push(`<h3 class="${ssrRenderClass([style.value.title, "text-sm font-medium"])}">${ssrInterpolate(__props.title)}</h3>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="${ssrRenderClass([[__props.title ? "mt-2" : "", style.value.text], "text-sm"])}">`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</div></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/BaseAlert.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_1 = Object.assign(_sfc_main, { __name: "UiBaseAlert" });

export { __nuxt_component_1 as _ };
//# sourceMappingURL=BaseAlert-BSViR_4S.mjs.map
