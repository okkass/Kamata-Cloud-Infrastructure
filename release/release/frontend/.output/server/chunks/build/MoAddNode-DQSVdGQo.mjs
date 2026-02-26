import { _ as _sfc_main$2 } from './BaseModal-XreF1fHA.mjs';
import { _ as __nuxt_component_1 } from './BaseAlert-BSViR_4S.mjs';
import { defineComponent, ref, withCtx, createVNode, createTextVNode, unref, createBlock, openBlock, toDisplayString, Fragment, renderList, withModifiers, computed, nextTick, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderList, ssrRenderSlot } from 'vue/server-renderer';
import { U as UiSubmitButton } from './SubmitButton-BLZt3uil.mjs';
import { u as useResourceList } from './useResourceList-BY3jHLdB.mjs';
import { u as useResourceCreate } from './useResourceCreate-C_T3ufwz.mjs';
import { u as useToast } from './server.mjs';
import { useForm } from 'vee-validate';
import { N as NODE } from './fetch-kOzZWayB.mjs';
import { F as FormInput } from './Input-jfnKbGQs.mjs';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "BaseLoading",
  __ssrInlineRender: true,
  props: {
    text: { default: "読み込み中..." }
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex justify-center items-center p-8 text-gray-500" }, _attrs))}><svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span class="text-sm font-medium">`);
      ssrRenderSlot(_ctx.$slots, "default", {}, () => {
        _push(`${ssrInterpolate(__props.text)}`);
      }, _push, _parent);
      _push(`</span></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/BaseLoading.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_2 = Object.assign(_sfc_main$1, { __name: "UiBaseLoading" });
function useAddNodeForm() {
  const { addToast } = useToast();
  const {
    data: candidateNodes,
    pending: candidatesPending,
    error: candidatesError,
    refresh: refreshCandidates
  } = useResourceList(NODE.name + "/candidates");
  const { executeCreate, isCreating } = useResourceCreate(NODE.name);
  const { meta: formMeta } = useForm({
    initialValues: { password: "" }
  });
  const handleAddNode = async (node, password, emit) => {
    const payload = {
      name: node.name,
      ipAddress: node.ipAddress,
      isAdmin: false,
      rootPassword: password
    };
    const result = await executeCreate(payload);
    if (result.success) {
      addToast({
        type: "success",
        message: `ノード「${node.name}」を追加しました。`
      });
      await refreshCandidates();
      return true;
    } else {
      addToast({
        type: "error",
        message: "ノードの追加に失敗しました。",
        details: result.error?.message
      });
      return false;
    }
  };
  return {
    candidateNodes,
    candidatesPending,
    candidatesError,
    isCreating,
    isValid: computed(() => formMeta.value.valid),
    handleAddNode,
    refreshCandidates
  };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "MoAddNode",
  __ssrInlineRender: true,
  props: { show: { type: Boolean, required: true } },
  emits: ["close", "success"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const {
      candidateNodes,
      candidatesPending,
      candidatesError,
      refreshCandidates,
      isCreating,
      handleAddNode
    } = useAddNodeForm();
    const showPasswordModal = ref(false);
    const selectedNode = ref(null);
    const password = ref("");
    const passwordInput = ref(null);
    const openPasswordModal = (node) => {
      selectedNode.value = node;
      password.value = "";
      showPasswordModal.value = true;
      nextTick(() => {
        passwordInput.value?.focus();
      });
    };
    const closePasswordModal = () => {
      showPasswordModal.value = false;
      selectedNode.value = null;
      password.value = "";
    };
    const submitAddNode = async () => {
      if (!selectedNode.value || !password.value || password.value.length < 8)
        return;
      const success = await handleAddNode(selectedNode.value, password.value, emit);
      if (success) {
        closePasswordModal();
        emit("success");
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_BaseModal = _sfc_main$2;
      const _component_UiBaseAlert = __nuxt_component_1;
      const _component_UiBaseLoading = __nuxt_component_2;
      const _component_UiSubmitButton = UiSubmitButton;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_BaseModal, {
        show: __props.show,
        title: "ノード追加",
        onClose: ($event) => _ctx.$emit("close")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="space-y-6"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UiBaseAlert, null, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<p${_scopeId2}> ネットワーク内で自動検知されたノード候補が表示されています。<br${_scopeId2}> 追加したいノードの「追加」ボタンをクリックしてください。 </p>`);
                } else {
                  return [
                    createVNode("p", null, [
                      createTextVNode(" ネットワーク内で自動検知されたノード候補が表示されています。"),
                      createVNode("br"),
                      createTextVNode(" 追加したいノードの「追加」ボタンをクリックしてください。 ")
                    ])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`<div class="border rounded-md overflow-hidden bg-white"${_scopeId}><div class="bg-gray-100 px-4 py-2 border-b flex justify-between items-center"${_scopeId}><h3 class="font-bold text-sm text-gray-700"${_scopeId}> 検知されたノード一覧 </h3><button class="text-xs text-blue-600 hover:underline"${ssrIncludeBooleanAttr(unref(candidatesPending)) ? " disabled" : ""}${_scopeId}> 更新 </button></div>`);
            if (unref(candidatesPending)) {
              _push2(ssrRenderComponent(_component_UiBaseLoading, null, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(` 候補を検索中... `);
                  } else {
                    return [
                      createTextVNode(" 候補を検索中... ")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else if (unref(candidatesError)) {
              _push2(`<div class="p-8 text-center text-red-500"${_scopeId}> 一覧の取得に失敗しました: ${ssrInterpolate(unref(candidatesError).message)}</div>`);
            } else if (!unref(candidateNodes) || unref(candidateNodes).length === 0) {
              _push2(`<div class="p-8 text-center text-gray-500"${_scopeId}> 追加可能なノードは見つかりませんでした。 </div>`);
            } else {
              _push2(`<table class="w-full text-sm text-left"${_scopeId}><thead class="table-header border-b"${_scopeId}><tr${_scopeId}><th class="table-header-cell"${_scopeId}>ノード名</th><th class="table-header-cell"${_scopeId}>IPアドレス</th><th class="table-header-cell text-center"${_scopeId}>操作</th></tr></thead><tbody${_scopeId}><!--[-->`);
              ssrRenderList(unref(candidateNodes), (node) => {
                _push2(`<tr class="table-row hover:bg-gray-50"${_scopeId}><td class="table-cell table-cell-title"${_scopeId}>${ssrInterpolate(node.name)}</td><td class="table-cell text-gray-600"${_scopeId}>${ssrInterpolate(node.ipAddress)}</td><td class="table-cell text-center"${_scopeId}><button type="button" class="btn btn-primary text-xs py-1 px-3"${ssrIncludeBooleanAttr(unref(isCreating)) ? " disabled" : ""}${_scopeId}> 追加 </button></td></tr>`);
              });
              _push2(`<!--]--></tbody></table>`);
            }
            _push2(`</div></div>`);
          } else {
            return [
              createVNode("div", { class: "space-y-6" }, [
                createVNode(_component_UiBaseAlert, null, {
                  default: withCtx(() => [
                    createVNode("p", null, [
                      createTextVNode(" ネットワーク内で自動検知されたノード候補が表示されています。"),
                      createVNode("br"),
                      createTextVNode(" 追加したいノードの「追加」ボタンをクリックしてください。 ")
                    ])
                  ]),
                  _: 1
                }),
                createVNode("div", { class: "border rounded-md overflow-hidden bg-white" }, [
                  createVNode("div", { class: "bg-gray-100 px-4 py-2 border-b flex justify-between items-center" }, [
                    createVNode("h3", { class: "font-bold text-sm text-gray-700" }, " 検知されたノード一覧 "),
                    createVNode("button", {
                      onClick: () => unref(refreshCandidates)(),
                      class: "text-xs text-blue-600 hover:underline",
                      disabled: unref(candidatesPending)
                    }, " 更新 ", 8, ["onClick", "disabled"])
                  ]),
                  unref(candidatesPending) ? (openBlock(), createBlock(_component_UiBaseLoading, { key: 0 }, {
                    default: withCtx(() => [
                      createTextVNode(" 候補を検索中... ")
                    ]),
                    _: 1
                  })) : unref(candidatesError) ? (openBlock(), createBlock("div", {
                    key: 1,
                    class: "p-8 text-center text-red-500"
                  }, " 一覧の取得に失敗しました: " + toDisplayString(unref(candidatesError).message), 1)) : !unref(candidateNodes) || unref(candidateNodes).length === 0 ? (openBlock(), createBlock("div", {
                    key: 2,
                    class: "p-8 text-center text-gray-500"
                  }, " 追加可能なノードは見つかりませんでした。 ")) : (openBlock(), createBlock("table", {
                    key: 3,
                    class: "w-full text-sm text-left"
                  }, [
                    createVNode("thead", { class: "table-header border-b" }, [
                      createVNode("tr", null, [
                        createVNode("th", { class: "table-header-cell" }, "ノード名"),
                        createVNode("th", { class: "table-header-cell" }, "IPアドレス"),
                        createVNode("th", { class: "table-header-cell text-center" }, "操作")
                      ])
                    ]),
                    createVNode("tbody", null, [
                      (openBlock(true), createBlock(Fragment, null, renderList(unref(candidateNodes), (node) => {
                        return openBlock(), createBlock("tr", {
                          key: node.id || node.ipAddress,
                          class: "table-row hover:bg-gray-50"
                        }, [
                          createVNode("td", { class: "table-cell table-cell-title" }, toDisplayString(node.name), 1),
                          createVNode("td", { class: "table-cell text-gray-600" }, toDisplayString(node.ipAddress), 1),
                          createVNode("td", { class: "table-cell text-center" }, [
                            createVNode("button", {
                              type: "button",
                              onClick: ($event) => openPasswordModal(node),
                              class: "btn btn-primary text-xs py-1 px-3",
                              disabled: unref(isCreating)
                            }, " 追加 ", 8, ["onClick", "disabled"])
                          ])
                        ]);
                      }), 128))
                    ])
                  ]))
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_BaseModal, {
        show: showPasswordModal.value,
        title: "パスワード入力",
        onClose: closePasswordModal,
        size: "sm"
      }, {
        footer: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="modal-footer"${_scopeId}><button type="button" class="btn btn-back"${ssrIncludeBooleanAttr(unref(isCreating)) ? " disabled" : ""}${_scopeId}> キャンセル </button>`);
            _push2(ssrRenderComponent(_component_UiSubmitButton, {
              label: "ノードを追加",
              loading: unref(isCreating),
              onClick: submitAddNode,
              disabled: unref(isCreating) || password.value.length < 8
            }, null, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "modal-footer" }, [
                createVNode("button", {
                  type: "button",
                  onClick: closePasswordModal,
                  class: "btn btn-back",
                  disabled: unref(isCreating)
                }, " キャンセル ", 8, ["disabled"]),
                createVNode(_component_UiSubmitButton, {
                  label: "ノードを追加",
                  loading: unref(isCreating),
                  onClick: submitAddNode,
                  disabled: unref(isCreating) || password.value.length < 8
                }, null, 8, ["loading", "disabled"])
              ])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<form class="space-y-4"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UiBaseAlert, {
              type: "warning",
              title: "実行確認"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<p${_scopeId2}> ノード <strong${_scopeId2}>${ssrInterpolate(selectedNode.value?.name)}</strong> (${ssrInterpolate(selectedNode.value?.ipAddress)}) をクラスターに追加します。 </p><p class="font-bold mt-1"${_scopeId2}>※この操作は取り消すことができません。</p>`);
                } else {
                  return [
                    createVNode("p", null, [
                      createTextVNode(" ノード "),
                      createVNode("strong", null, toDisplayString(selectedNode.value?.name), 1),
                      createTextVNode(" (" + toDisplayString(selectedNode.value?.ipAddress) + ") をクラスターに追加します。 ", 1)
                    ]),
                    createVNode("p", { class: "font-bold mt-1" }, "※この操作は取り消すことができません。")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(FormInput, {
              label: "ルートパスワード",
              name: "password",
              type: "password",
              modelValue: password.value,
              "onUpdate:modelValue": ($event) => password.value = $event,
              placeholder: "8文字以上で入力してください",
              minlength: 8,
              required: "",
              ref_key: "passwordInput",
              ref: passwordInput
            }, null, _parent2, _scopeId));
            _push2(`</form>`);
          } else {
            return [
              createVNode("form", {
                onSubmit: withModifiers(submitAddNode, ["prevent"]),
                class: "space-y-4"
              }, [
                createVNode(_component_UiBaseAlert, {
                  type: "warning",
                  title: "実行確認"
                }, {
                  default: withCtx(() => [
                    createVNode("p", null, [
                      createTextVNode(" ノード "),
                      createVNode("strong", null, toDisplayString(selectedNode.value?.name), 1),
                      createTextVNode(" (" + toDisplayString(selectedNode.value?.ipAddress) + ") をクラスターに追加します。 ", 1)
                    ]),
                    createVNode("p", { class: "font-bold mt-1" }, "※この操作は取り消すことができません。")
                  ]),
                  _: 1
                }),
                createVNode(FormInput, {
                  label: "ルートパスワード",
                  name: "password",
                  type: "password",
                  modelValue: password.value,
                  "onUpdate:modelValue": ($event) => password.value = $event,
                  placeholder: "8文字以上で入力してください",
                  minlength: 8,
                  required: "",
                  ref_key: "passwordInput",
                  ref: passwordInput
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ], 32)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/MoAddNode.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const MoAddNodeToCluster = Object.assign(_sfc_main, { __name: "MoAddNode" });

export { MoAddNodeToCluster as M };
//# sourceMappingURL=MoAddNode-DQSVdGQo.mjs.map
