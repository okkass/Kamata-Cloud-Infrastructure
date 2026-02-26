import { _ as _sfc_main$1 } from './BaseModal-XreF1fHA.mjs';
import { defineComponent, mergeProps, unref, withCtx, isRef, createVNode, withModifiers, createBlock, openBlock, Fragment, renderList, computed, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderList } from 'vue/server-renderer';
import { useForm, useFieldArray } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { u as useResourceCreate } from './useResourceCreate-C_T3ufwz.mjs';
import { u as useFormAction } from './useModalAction-CCl6IdMe.mjs';
import { V as VirtualNetworkCreateFullSchema } from './virtual-network-9nD05ROF.mjs';
import { b as NETWORK } from './fetch-kOzZWayB.mjs';
import { F as FormInput } from './Input-jfnKbGQs.mjs';
import { U as UiSubmitButton } from './SubmitButton-BLZt3uil.mjs';
import { _ as _export_sfc } from './server.mjs';

function useVirtualNetworkCreateForm(emit) {
  const { handleFormSubmit, makeHandleClose } = useFormAction();
  const { executeCreate, isCreating } = useResourceCreate(NETWORK.name);
  const { errors, handleSubmit, defineField, meta, resetForm } = useForm({
    validationSchema: toTypedSchema(VirtualNetworkCreateFullSchema),
    initialValues: {
      name: "",
      cidr: "",
      initialSubnets: []
    }
  });
  const [name, nameAttrs] = defineField("name");
  const [cidr, cidrAttrs] = defineField("cidr");
  const {
    fields: initialSubnets,
    push: pushSubnet,
    remove: removeSubnet
  } = useFieldArray("initialSubnets");
  const addSubnet = () => {
    pushSubnet({
      id: `new-${Date.now()}`,
      name: "",
      cidr: ""
    });
  };
  const onFormSubmit = (emit2) => handleFormSubmit(
    handleSubmit,
    {
      execute: async (formValues) => {
        const payload = {
          name: formValues.name,
          cidr: formValues.cidr,
          initialSubnets: formValues.initialSubnets.map((subnet) => ({
            name: subnet.name,
            cidr: subnet.cidr
          }))
        };
        return await executeCreate(payload);
      },
      onSuccess: async () => {
        resetForm();
      },
      onSuccessMessage: (payload) => `仮想ネットワーク「${payload.name}」を作成しました。`,
      emitCloseImmediately: true
    },
    emit2
  );
  const makehandleClose = (emit2) => makeHandleClose(resetForm, emit2);
  return {
    errors,
    name,
    nameAttrs,
    cidr,
    cidrAttrs,
    initialSubnets,
    addSubnet,
    removeSubnet,
    isCreating,
    isValid: computed(() => meta.value.valid),
    onFormSubmit,
    makehandleClose
  };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "MoVirtualNetworkCreate",
  __ssrInlineRender: true,
  props: { show: { type: Boolean, required: true } },
  emits: ["close", "success"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const getError = (index, field) => {
      const bracketKey = `initialSubnets[${index}].${field}`;
      const errs = errors.value;
      return errs[bracketKey];
    };
    const {
      errors,
      name,
      nameAttrs,
      cidr,
      cidrAttrs,
      initialSubnets,
      addSubnet,
      removeSubnet,
      isCreating,
      isValid,
      onFormSubmit,
      makehandleClose
    } = useVirtualNetworkCreateForm();
    const handleClose = makehandleClose(emit);
    const onSubmit = onFormSubmit(emit);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_BaseModal = _sfc_main$1;
      _push(ssrRenderComponent(_component_BaseModal, mergeProps({
        show: __props.show,
        title: "仮想ネットワーク作成",
        onClose: unref(handleClose)
      }, _attrs), {
        footer: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="modal-footer" data-v-29c2fadf${_scopeId}>`);
            _push2(ssrRenderComponent(UiSubmitButton, {
              disabled: unref(isCreating) || !unref(isValid),
              loading: unref(isCreating),
              label: "仮想ネットワークを作成",
              form: "network-create-form",
              type: "submit"
            }, null, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "modal-footer" }, [
                createVNode(UiSubmitButton, {
                  disabled: unref(isCreating) || !unref(isValid),
                  loading: unref(isCreating),
                  label: "仮想ネットワークを作成",
                  form: "network-create-form",
                  type: "submit"
                }, null, 8, ["disabled", "loading"])
              ])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<form id="network-create-form" class="space-y-6" data-v-29c2fadf${_scopeId}><div class="space-y-4" data-v-29c2fadf${_scopeId}>`);
            _push2(ssrRenderComponent(FormInput, mergeProps({
              label: "ネットワーク名",
              name: "network-name",
              type: "text",
              modelValue: unref(name),
              "onUpdate:modelValue": ($event) => isRef(name) ? name.value = $event : null
            }, unref(nameAttrs), {
              error: unref(errors).name,
              required: true,
              placeholder: "例: my-vpc-01"
            }), null, _parent2, _scopeId));
            _push2(ssrRenderComponent(FormInput, mergeProps({
              label: "ネットワークアドレス (CIDR)",
              name: "network-cidr",
              type: "text",
              modelValue: unref(cidr),
              "onUpdate:modelValue": ($event) => isRef(cidr) ? cidr.value = $event : null
            }, unref(cidrAttrs), {
              error: unref(errors).cidr,
              required: true,
              placeholder: "例: 10.0.0.0/16"
            }), null, _parent2, _scopeId));
            _push2(`<div class="border rounded-md overflow-hidden bg-white mt-6" data-v-29c2fadf${_scopeId}><div class="bg-gray-100 px-4 py-2 border-b flex justify-between items-center" data-v-29c2fadf${_scopeId}><h3 class="font-bold text-sm text-gray-700" data-v-29c2fadf${_scopeId}>初期サブネット</h3><button type="button" class="text-xs bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-2 py-1 rounded shadow-sm transition-colors" data-v-29c2fadf${_scopeId}> + 追加 </button></div><div class="p-4 bg-gray-50" data-v-29c2fadf${_scopeId}>`);
            if (unref(initialSubnets).length === 0) {
              _push2(`<div class="text-center text-gray-400 py-2 text-sm" data-v-29c2fadf${_scopeId}> サブネットがありません。追加ボタンから作成してください。 </div>`);
            } else {
              _push2(`<div class="space-y-4" data-v-29c2fadf${_scopeId}><!--[-->`);
              ssrRenderList(unref(initialSubnets), (field, index) => {
                _push2(`<div class="bg-white p-3 rounded border border-gray-200 shadow-sm" data-v-29c2fadf${_scopeId}><div class="grid grid-cols-12 gap-3 items-start" data-v-29c2fadf${_scopeId}><div class="col-span-5" data-v-29c2fadf${_scopeId}>`);
                _push2(ssrRenderComponent(FormInput, {
                  label: "名前",
                  name: `subnet-name-${index}`,
                  modelValue: field.value.name,
                  "onUpdate:modelValue": ($event) => field.value.name = $event,
                  error: getError(index, "name"),
                  placeholder: "例: public-subnet",
                  class: "w-full"
                }, null, _parent2, _scopeId));
                _push2(`</div><div class="col-span-4" data-v-29c2fadf${_scopeId}>`);
                _push2(ssrRenderComponent(FormInput, {
                  label: "CIDR",
                  name: `subnet-cidr-${index}`,
                  modelValue: field.value.cidr,
                  "onUpdate:modelValue": ($event) => field.value.cidr = $event,
                  error: getError(index, "cidr"),
                  placeholder: "例: 10.0.1.0/24",
                  class: "w-full"
                }, null, _parent2, _scopeId));
                _push2(`</div><div class="col-span-3 flex justify-end pt-6" data-v-29c2fadf${_scopeId}><button type="button" class="text-gray-400 hover:text-red-500 p-1 flex items-center gap-1 text-xs" title="削除" data-v-29c2fadf${_scopeId}><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-29c2fadf${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" data-v-29c2fadf${_scopeId}></path></svg></button></div></div></div>`);
              });
              _push2(`<!--]--></div>`);
            }
            _push2(`</div></div></div></form>`);
          } else {
            return [
              createVNode("form", {
                id: "network-create-form",
                onSubmit: withModifiers(unref(onSubmit), ["prevent"]),
                class: "space-y-6"
              }, [
                createVNode("div", { class: "space-y-4" }, [
                  createVNode(FormInput, mergeProps({
                    label: "ネットワーク名",
                    name: "network-name",
                    type: "text",
                    modelValue: unref(name),
                    "onUpdate:modelValue": ($event) => isRef(name) ? name.value = $event : null
                  }, unref(nameAttrs), {
                    error: unref(errors).name,
                    required: true,
                    placeholder: "例: my-vpc-01"
                  }), null, 16, ["modelValue", "onUpdate:modelValue", "error"]),
                  createVNode(FormInput, mergeProps({
                    label: "ネットワークアドレス (CIDR)",
                    name: "network-cidr",
                    type: "text",
                    modelValue: unref(cidr),
                    "onUpdate:modelValue": ($event) => isRef(cidr) ? cidr.value = $event : null
                  }, unref(cidrAttrs), {
                    error: unref(errors).cidr,
                    required: true,
                    placeholder: "例: 10.0.0.0/16"
                  }), null, 16, ["modelValue", "onUpdate:modelValue", "error"]),
                  createVNode("div", { class: "border rounded-md overflow-hidden bg-white mt-6" }, [
                    createVNode("div", { class: "bg-gray-100 px-4 py-2 border-b flex justify-between items-center" }, [
                      createVNode("h3", { class: "font-bold text-sm text-gray-700" }, "初期サブネット"),
                      createVNode("button", {
                        type: "button",
                        onClick: unref(addSubnet),
                        class: "text-xs bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-2 py-1 rounded shadow-sm transition-colors"
                      }, " + 追加 ", 8, ["onClick"])
                    ]),
                    createVNode("div", { class: "p-4 bg-gray-50" }, [
                      unref(initialSubnets).length === 0 ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: "text-center text-gray-400 py-2 text-sm"
                      }, " サブネットがありません。追加ボタンから作成してください。 ")) : (openBlock(), createBlock("div", {
                        key: 1,
                        class: "space-y-4"
                      }, [
                        (openBlock(true), createBlock(Fragment, null, renderList(unref(initialSubnets), (field, index) => {
                          return openBlock(), createBlock("div", {
                            key: field.key,
                            class: "bg-white p-3 rounded border border-gray-200 shadow-sm"
                          }, [
                            createVNode("div", { class: "grid grid-cols-12 gap-3 items-start" }, [
                              createVNode("div", { class: "col-span-5" }, [
                                createVNode(FormInput, {
                                  label: "名前",
                                  name: `subnet-name-${index}`,
                                  modelValue: field.value.name,
                                  "onUpdate:modelValue": ($event) => field.value.name = $event,
                                  error: getError(index, "name"),
                                  placeholder: "例: public-subnet",
                                  class: "w-full"
                                }, null, 8, ["name", "modelValue", "onUpdate:modelValue", "error"])
                              ]),
                              createVNode("div", { class: "col-span-4" }, [
                                createVNode(FormInput, {
                                  label: "CIDR",
                                  name: `subnet-cidr-${index}`,
                                  modelValue: field.value.cidr,
                                  "onUpdate:modelValue": ($event) => field.value.cidr = $event,
                                  error: getError(index, "cidr"),
                                  placeholder: "例: 10.0.1.0/24",
                                  class: "w-full"
                                }, null, 8, ["name", "modelValue", "onUpdate:modelValue", "error"])
                              ]),
                              createVNode("div", { class: "col-span-3 flex justify-end pt-6" }, [
                                createVNode("button", {
                                  type: "button",
                                  onClick: ($event) => unref(removeSubnet)(index),
                                  class: "text-gray-400 hover:text-red-500 p-1 flex items-center gap-1 text-xs",
                                  title: "削除"
                                }, [
                                  (openBlock(), createBlock("svg", {
                                    xmlns: "http://www.w3.org/2000/svg",
                                    class: "h-5 w-5",
                                    fill: "none",
                                    viewBox: "0 0 24 24",
                                    stroke: "currentColor"
                                  }, [
                                    createVNode("path", {
                                      "stroke-linecap": "round",
                                      "stroke-linejoin": "round",
                                      "stroke-width": "2",
                                      d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    })
                                  ]))
                                ], 8, ["onClick"])
                              ])
                            ])
                          ]);
                        }), 128))
                      ]))
                    ])
                  ])
                ])
              ], 40, ["onSubmit"])
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/MoVirtualNetworkCreate.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const MoVirtualNetworkCreate = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main, [["__scopeId", "data-v-29c2fadf"]]), { __name: "MoVirtualNetworkCreate" });

export { MoVirtualNetworkCreate as M };
//# sourceMappingURL=MoVirtualNetworkCreate-CipS8Q50.mjs.map
