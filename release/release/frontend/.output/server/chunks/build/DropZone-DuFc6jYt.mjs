import { defineComponent, mergeModels, useModel, ref, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderClass, ssrRenderAttr, ssrRenderComponent } from 'vue/server-renderer';
import { _ as _export_sfc, u as useToast } from './server.mjs';

const _sfc_main$1 = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  _push(`<svg${ssrRenderAttrs(mergeProps({
    class: "mx-auto h-12 w-12 text-gray-400",
    viewBox: "0 0 24 24",
    fill: "none"
  }, _attrs))}><path d="M12 16V4m0 0l-4 4m4-4l4 4" stroke="currentColor" stroke-width="1.5"></path><path d="M20 16v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2" stroke="currentColor" stroke-width="1.5"></path></svg>`);
}
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/icon/upload.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["ssrRender", _sfc_ssrRender]]), { __name: "IconUpload" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "DropZone",
  __ssrInlineRender: true,
  props: /* @__PURE__ */ mergeModels({
    label: {
      type: String,
      default: "ファイルアップロード"
    },
    accept: {
      type: String,
      default: "*/*"
      // デフォルトでは全てのファイル形式を許可
    },
    required: {
      type: Boolean,
      default: false
    }
  }, {
    "modelValue": {},
    "modelModifiers": {}
  }),
  emits: ["update:modelValue"],
  setup(__props) {
    const modelValue = useModel(__props, "modelValue");
    ref(null);
    const isDragging = ref(false);
    useToast();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_IconUpload = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(_attrs)} data-v-201d072c><label class="form-label-sm" data-v-201d072c>${ssrInterpolate(__props.label)} `);
      if (__props.required) {
        _push(`<span class="required-asterisk" data-v-201d072c>*</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</label><div class="${ssrRenderClass([{ "is-dragging": isDragging.value }, "drop-zone"])}" data-v-201d072c><input type="file" class="sr-only"${ssrRenderAttr("accept", __props.accept)} data-v-201d072c><div class="text-center" data-v-201d072c>`);
      _push(ssrRenderComponent(_component_IconUpload, { class: "mx-auto h-12 w-12 text-gray-400" }, null, _parent));
      _push(`<div class="mt-4 flex text-sm text-gray-600" data-v-201d072c><p class="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 hover:text-blue-500" data-v-201d072c> ファイルを選択 </p><p class="pl-1" data-v-201d072c>、またはドラッグ＆ドロップ</p></div><p class="text-xs text-gray-500 mt-1" data-v-201d072c>対応形式: ${ssrInterpolate(__props.accept)}</p>`);
      if (modelValue.value) {
        _push(`<p class="text-sm font-semibold text-green-600 mt-2" data-v-201d072c> 選択中のファイル: ${ssrInterpolate(modelValue.value.name)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Form/DropZone.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const DropZone = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main, [["__scopeId", "data-v-201d072c"]]), { __name: "FormDropZone" });

export { DropZone as D };
//# sourceMappingURL=DropZone-DuFc6jYt.mjs.map
