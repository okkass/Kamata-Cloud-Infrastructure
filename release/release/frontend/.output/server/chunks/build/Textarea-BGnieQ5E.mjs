import { defineComponent, mergeModels, useModel, computed, useAttrs, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  ...{
    inheritAttrs: false
  },
  __name: "Textarea",
  __ssrInlineRender: true,
  props: /* @__PURE__ */ mergeModels({
    label: {},
    name: {},
    error: {},
    rows: {},
    required: { type: Boolean }
  }, {
    "modelValue": {},
    "modelModifiers": {},
    "attrs": {},
    "attrsModifiers": {}
  }),
  emits: ["update:modelValue", "update:attrs"],
  setup(__props) {
    const model = useModel(__props, "modelValue");
    const validationAttrs = useModel(__props, "attrs");
    const allAttrs = computed(() => {
      const fallthroughAttrs = useAttrs();
      return {
        ...validationAttrs.value || {},
        // vee-validateの属性
        ...fallthroughAttrs
        // その他の汎用属性
      };
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      if (__props.label) {
        _push(`<label${ssrRenderAttr("for", __props.name)} class="form-label">${ssrInterpolate(__props.label)} `);
        if (__props.required) {
          _push(`<span class="required-asterisk">*</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</label>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<textarea${ssrRenderAttrs(mergeProps({ id: __props.name }, allAttrs.value, {
        class: ["form-input", [_ctx.$attrs.class, { "form-border-error": __props.error }]],
        rows: __props.rows
      }), "textarea")}>${ssrInterpolate(model.value)}</textarea>`);
      if (__props.error) {
        _push(`<p class="text-error">${ssrInterpolate(__props.error)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Form/Textarea.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const FormTextarea = Object.assign(_sfc_main, { __name: "FormTextarea" });

export { FormTextarea as F };
//# sourceMappingURL=Textarea-BGnieQ5E.mjs.map
