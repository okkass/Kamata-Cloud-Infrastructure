import { defineComponent, ref, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrRenderClass, ssrIncludeBooleanAttr, ssrRenderSlot, ssrInterpolate } from 'vue/server-renderer';
import { _ as _export_sfc } from './server.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "SubmitButton",
  __ssrInlineRender: true,
  props: {
    label: {},
    disabled: { type: Boolean },
    loading: { type: Boolean },
    form: {},
    type: { default: "button" },
    btnVariant: { default: "btn-primary" }
  },
  setup(__props) {
    const isHovered = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "relative inline-block" }, _attrs))} data-v-d052d9c7>`);
      if (__props.disabled && isHovered.value) {
        _push(`<div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-red-600 text-white text-xs rounded shadow-lg whitespace-nowrap z-50" data-v-d052d9c7> 入力値が不足しています <div class="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-red-600" data-v-d052d9c7></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button${ssrRenderAttr("type", __props.type)}${ssrRenderAttr("form", __props.form)} class="${ssrRenderClass([[
        __props.btnVariant,
        { "opacity-50 cursor-not-allowed": __props.disabled || __props.loading }
      ], "btn"])}"${ssrIncludeBooleanAttr(__props.disabled || __props.loading) ? " disabled" : ""} data-v-d052d9c7>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, () => {
        _push(`${ssrInterpolate(__props.loading ? "処理中..." : __props.label)}`);
      }, _push, _parent);
      _push(`</button></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/SubmitButton.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const UiSubmitButton = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main, [["__scopeId", "data-v-d052d9c7"]]), { __name: "UiSubmitButton" });

export { UiSubmitButton as U };
//# sourceMappingURL=SubmitButton-BLZt3uil.mjs.map
