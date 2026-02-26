import { _ as _sfc_main$1 } from './BaseModal-XreF1fHA.mjs';
import { _ as __nuxt_component_1 } from './BaseAlert-BSViR_4S.mjs';
import { U as UiSubmitButton } from './SubmitButton-BLZt3uil.mjs';
import { f as formatDateTime } from './date-D5dH0cF_.mjs';
import { defineComponent, ref, withCtx, createTextVNode, createVNode, unref, toDisplayString, computed, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { u as useToast } from './server.mjs';
import { u as useResourceCreate } from './useResourceCreate-C_T3ufwz.mjs';
import { C as ConfirmationModal } from './ConfirmationModal-DY_3GDmV.mjs';

function useSnapshotRestore() {
  const { addToast } = useToast();
  const isRestoring = ref(false);
  const executeRestoreApi = async (id, name) => {
    const { executeCreate } = useResourceCreate(`snapshots/${id}/restore`);
    isRestoring.value = true;
    try {
      const result = await executeCreate({});
      addToast({
        type: result.success ? "success" : "error",
        message: result.success ? `スナップショット「${name}」からの復元を開始しました。` : "復元に失敗しました。",
        details: result.error?.message
      });
      return result.success;
    } finally {
      isRestoring.value = false;
    }
  };
  return {
    isRestoring: computed(() => isRestoring.value),
    executeRestoreApi
  };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "MoSnapshotRestore",
  __ssrInlineRender: true,
  props: {
    show: { type: Boolean, required: true },
    data: {
      type: Object,
      default: null
    }
  },
  emits: ["close", "success"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const { isRestoring, executeRestoreApi } = useSnapshotRestore();
    const showConfirm = ref(false);
    const openConfirm = () => {
      showConfirm.value = true;
    };
    const onConfirmed = async () => {
      showConfirm.value = false;
      if (!props.data?.id) return;
      const success = await executeRestoreApi(props.data.id, props.data.name);
      if (success) {
        emit("success");
        emit("close");
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_BaseModal = _sfc_main$1;
      const _component_UiBaseAlert = __nuxt_component_1;
      const _component_UiSubmitButton = UiSubmitButton;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_BaseModal, {
        show: __props.show,
        title: "スナップショットから復元",
        onClose: ($event) => _ctx.$emit("close")
      }, {
        footer: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="modal-footer flex justify-end gap-2"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UiSubmitButton, {
              "btn-variant": "btn-danger",
              label: "スナップショットから復元",
              onClick: openConfirm,
              disabled: unref(isRestoring),
              loading: unref(isRestoring)
            }, null, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "modal-footer flex justify-end gap-2" }, [
                createVNode(_component_UiSubmitButton, {
                  "btn-variant": "btn-danger",
                  label: "スナップショットから復元",
                  onClick: openConfirm,
                  disabled: unref(isRestoring),
                  loading: unref(isRestoring)
                }, null, 8, ["disabled", "loading"])
              ])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="space-y-6"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UiBaseAlert, { type: "warning" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` この操作を行うと、現在の仮想マシンのデータは完全に上書きされます。<br${_scopeId2}> 復元を実行する前に、現在の状態のスナップショットを取得することをお勧めします。 `);
                } else {
                  return [
                    createTextVNode(" この操作を行うと、現在の仮想マシンのデータは完全に上書きされます。"),
                    createVNode("br"),
                    createTextVNode(" 復元を実行する前に、現在の状態のスナップショットを取得することをお勧めします。 ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`<div class="border rounded-md bg-white overflow-hidden"${_scopeId}><div class="bg-gray-50 px-4 py-2 border-b"${_scopeId}><h4 class="font-bold text-sm text-gray-700"${_scopeId}>復元対象データ</h4></div><div class="p-4 grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6 text-sm"${_scopeId}><div${_scopeId}><span class="block text-xs text-gray-500 mb-1"${_scopeId}>名前</span><span class="font-medium text-gray-900"${_scopeId}>${ssrInterpolate(__props.data?.name || "-")}</span></div><div${_scopeId}><span class="block text-xs text-gray-500 mb-1"${_scopeId}>作成日時</span><span class="text-gray-900"${_scopeId}>${ssrInterpolate(("formatDateTime" in _ctx ? _ctx.formatDateTime : unref(formatDateTime))(__props.data?.createdAt))}</span></div><div class="sm:col-span-2"${_scopeId}><span class="block text-xs text-gray-500 mb-1"${_scopeId}>説明</span><span class="text-gray-900"${_scopeId}>${ssrInterpolate(__props.data?.description || "-")}</span></div><div class="sm:col-span-2"${_scopeId}><span class="block text-xs text-gray-500 mb-1"${_scopeId}>ID</span><span class="text-xs text-gray-400 font-mono break-all"${_scopeId}>${ssrInterpolate(__props.data?.id || "-")}</span></div></div></div></div>`);
          } else {
            return [
              createVNode("div", { class: "space-y-6" }, [
                createVNode(_component_UiBaseAlert, { type: "warning" }, {
                  default: withCtx(() => [
                    createTextVNode(" この操作を行うと、現在の仮想マシンのデータは完全に上書きされます。"),
                    createVNode("br"),
                    createTextVNode(" 復元を実行する前に、現在の状態のスナップショットを取得することをお勧めします。 ")
                  ]),
                  _: 1
                }),
                createVNode("div", { class: "border rounded-md bg-white overflow-hidden" }, [
                  createVNode("div", { class: "bg-gray-50 px-4 py-2 border-b" }, [
                    createVNode("h4", { class: "font-bold text-sm text-gray-700" }, "復元対象データ")
                  ]),
                  createVNode("div", { class: "p-4 grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6 text-sm" }, [
                    createVNode("div", null, [
                      createVNode("span", { class: "block text-xs text-gray-500 mb-1" }, "名前"),
                      createVNode("span", { class: "font-medium text-gray-900" }, toDisplayString(__props.data?.name || "-"), 1)
                    ]),
                    createVNode("div", null, [
                      createVNode("span", { class: "block text-xs text-gray-500 mb-1" }, "作成日時"),
                      createVNode("span", { class: "text-gray-900" }, toDisplayString(("formatDateTime" in _ctx ? _ctx.formatDateTime : unref(formatDateTime))(__props.data?.createdAt)), 1)
                    ]),
                    createVNode("div", { class: "sm:col-span-2" }, [
                      createVNode("span", { class: "block text-xs text-gray-500 mb-1" }, "説明"),
                      createVNode("span", { class: "text-gray-900" }, toDisplayString(__props.data?.description || "-"), 1)
                    ]),
                    createVNode("div", { class: "sm:col-span-2" }, [
                      createVNode("span", { class: "block text-xs text-gray-500 mb-1" }, "ID"),
                      createVNode("span", { class: "text-xs text-gray-400 font-mono break-all" }, toDisplayString(__props.data?.id || "-"), 1)
                    ])
                  ])
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(ConfirmationModal, {
        show: showConfirm.value,
        title: "復元の最終確認",
        message: "現在の仮想マシンの状態はこのスナップショットの内容で上書きされ、元に戻すことはできません。よろしいですか？",
        "confirm-text": "復元する",
        "confirm-button-class": "btn-danger",
        onConfirm: onConfirmed,
        onCancel: ($event) => showConfirm.value = false
      }, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/MoSnapshotRestore.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const MoSnapshotRestore = Object.assign(_sfc_main, { __name: "MoSnapshotRestore" });

export { MoSnapshotRestore as M };
//# sourceMappingURL=MoSnapshotRestore-DTRZeopY.mjs.map
