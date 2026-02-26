import { _ as _sfc_main$1 } from './BaseModal-XreF1fHA.mjs';
import { defineComponent, mergeProps, withCtx, createVNode, createBlock, openBlock, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ConfirmationModal",
  __ssrInlineRender: true,
  props: {
    show: { type: Boolean, required: true },
    title: { type: String, default: "実行の確認" },
    message: { type: String, required: true },
    confirmText: { type: String, default: "実行" }
  },
  emits: ["confirm", "cancel"],
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_BaseModal = _sfc_main$1;
      _push(ssrRenderComponent(_component_BaseModal, mergeProps({
        show: __props.show,
        title: __props.title,
        onClose: ($event) => _ctx.$emit("cancel"),
        size: "sm"
      }, _attrs), {
        footer: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="modal-footer flex gap-3"${_scopeId}><button type="button" class="btn btn-secondary"${_scopeId}> キャンセル </button><button type="button" class="btn bg-red-600 text-white hover:bg-red-700 border-transparent shadow-sm"${_scopeId}>${ssrInterpolate(__props.confirmText)}</button></div>`);
          } else {
            return [
              createVNode("div", { class: "modal-footer flex gap-3" }, [
                createVNode("button", {
                  type: "button",
                  class: "btn btn-secondary",
                  onClick: ($event) => _ctx.$emit("cancel")
                }, " キャンセル ", 8, ["onClick"]),
                createVNode("button", {
                  type: "button",
                  class: "btn bg-red-600 text-white hover:bg-red-700 border-transparent shadow-sm",
                  onClick: ($event) => _ctx.$emit("confirm")
                }, toDisplayString(__props.confirmText), 9, ["onClick"])
              ])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="p-1 space-y-4"${_scopeId}><div class="flex items-start gap-3"${_scopeId}><div class="text-yellow-500 mt-1"${_scopeId}><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"${_scopeId}></path></svg></div><p class="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed"${_scopeId}>${ssrInterpolate(__props.message)}</p></div></div>`);
          } else {
            return [
              createVNode("div", { class: "p-1 space-y-4" }, [
                createVNode("div", { class: "flex items-start gap-3" }, [
                  createVNode("div", { class: "text-yellow-500 mt-1" }, [
                    (openBlock(), createBlock("svg", {
                      xmlns: "http://www.w3.org/2000/svg",
                      class: "h-6 w-6",
                      fill: "none",
                      viewBox: "0 0 24 24",
                      stroke: "currentColor"
                    }, [
                      createVNode("path", {
                        "stroke-linecap": "round",
                        "stroke-linejoin": "round",
                        "stroke-width": "2",
                        d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      })
                    ]))
                  ]),
                  createVNode("p", { class: "text-sm text-gray-700 whitespace-pre-wrap leading-relaxed" }, toDisplayString(__props.message), 1)
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ConfirmationModal.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const ConfirmationModal = Object.assign(_sfc_main, { __name: "ConfirmationModal" });

export { ConfirmationModal as C };
//# sourceMappingURL=ConfirmationModal-DY_3GDmV.mjs.map
