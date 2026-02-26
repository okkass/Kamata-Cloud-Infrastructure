import { _ as _sfc_main$1 } from './BaseModal-XreF1fHA.mjs';
import { defineComponent, mergeProps, unref, withCtx, isRef, createBlock, openBlock, withModifiers, createVNode, Fragment, renderList, watch, computed, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderList } from 'vue/server-renderer';
import { useForm, useFieldArray } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { u as useResourceUpdater } from './useResourceUpdater-D_YM1lnm.mjs';
import { u as useFormAction } from './useModalAction-CCl6IdMe.mjs';
import { a as VirtualNetworkEditSchema } from './virtual-network-9nD05ROF.mjs';
import { F as FormInput } from './Input-jfnKbGQs.mjs';
import { U as UiSubmitButton } from './SubmitButton-BLZt3uil.mjs';

function useVirtualNetworkEditForm(props) {
  const { handleFormSubmit, makeHandleClose } = useFormAction();
  const { editedData, init, save, isDirty, isSaving } = useResourceUpdater();
  const {
    errors,
    handleSubmit,
    defineField,
    meta,
    resetForm,
    setValues,
    values
  } = useForm({
    validationSchema: toTypedSchema(VirtualNetworkEditSchema),
    initialValues: {
      name: "",
      subnets: []
    }
  });
  const [name, nameAttrs] = defineField("name");
  const {
    fields: subnets,
    push: pushSubnet,
    remove: removeSubnet
  } = useFieldArray("subnets");
  watch(
    () => [props.show, props.data],
    ([show, data]) => {
      if (show && data) {
        init(data, getResourceConfig(data));
        setValues({
          name: data.name,
          cidr: data.cidr,
          subnets: (data.subnets || []).map((s) => ({
            id: s.id,
            name: s.name,
            cidr: s.cidr
          }))
        });
      }
    },
    { immediate: true }
  );
  function getResourceConfig(data) {
    return {
      base: {
        endpoint: `virtual-networks/${data.id}`,
        fields: ["name"]
      },
      collections: {
        subnets: {
          endpoint: `virtual-networks/${data.id}/subnets`,
          bulkEndpoint: `virtual-networks/${data.id}/subnets/bulk`,
          idKey: "id",
          newIdPrefix: "new-",
          fields: ["name", "cidr"],
          bulkKeys: { create: "create", update: "patch", delete: "remove" }
        }
      }
    };
  }
  watch(
    () => values,
    (newValues) => {
      if (editedData.value) {
        editedData.value.name = newValues.name;
        editedData.value.cidr = newValues.cidr;
        editedData.value.subnets = newValues.subnets.map((subnet) => ({
          id: subnet.id,
          name: subnet.name,
          cidr: subnet.cidr,
          createdAt: ""
        }));
      }
    },
    { deep: true }
  );
  const createEmptySubnet = () => ({
    id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name: "",
    cidr: ""
  });
  const addSubnet = () => pushSubnet(createEmptySubnet());
  const removeSubnetHandler = (idx) => removeSubnet(idx);
  const validate = () => {
    return meta.value.valid;
  };
  const onFormSubmit = (emit) => handleFormSubmit(
    handleSubmit,
    {
      execute: async () => {
        if (!validate()) {
          return { success: false };
        }
        const success = await save();
        return { success };
      },
      onSuccess: () => {
        resetForm();
      },
      onSuccessMessage: () => `仮想ネットワーク「${values.name}」を更新しました。`,
      emitCloseImmediately: true
    },
    emit
  );
  const makehandleClose = (emit) => makeHandleClose(resetForm, emit);
  return {
    // State
    editedData,
    errors,
    isDirty,
    isSaving,
    // Form fields
    name,
    nameAttrs,
    // Subnet management
    subnets,
    addSubnet,
    removeSubnet: removeSubnetHandler,
    // Validation & submission
    isValid: computed(() => meta.value.valid),
    onFormSubmit,
    makehandleClose
  };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "MoVirtualNetworkEdit",
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
    const getError = (index, field) => {
      const bracketKey = `subnets[${index}].${field}`;
      const errs = errors.value;
      return errs[bracketKey];
    };
    const {
      editedData,
      errors,
      name,
      nameAttrs,
      subnets,
      addSubnet,
      removeSubnet,
      isValid,
      isSaving,
      onFormSubmit,
      makehandleClose
    } = useVirtualNetworkEditForm(props);
    const handleClose = makehandleClose(emit);
    const onSubmit = onFormSubmit(emit);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_BaseModal = _sfc_main$1;
      _push(ssrRenderComponent(_component_BaseModal, mergeProps({
        show: __props.show,
        title: "仮想ネットワーク編集",
        onClose: unref(handleClose),
        size: "lg"
      }, _attrs), {
        footer: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="modal-footer"${_scopeId}>`);
            _push2(ssrRenderComponent(UiSubmitButton, {
              disabled: unref(isSaving) || !unref(isValid),
              loading: unref(isSaving),
              label: "仮想ネットワークを更新",
              form: "network-edit-form",
              type: "submit"
            }, null, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "modal-footer" }, [
                createVNode(UiSubmitButton, {
                  disabled: unref(isSaving) || !unref(isValid),
                  loading: unref(isSaving),
                  label: "仮想ネットワークを更新",
                  form: "network-edit-form",
                  type: "submit"
                }, null, 8, ["disabled", "loading"])
              ])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (!unref(editedData)) {
              _push2(`<div class="p-8 text-center text-gray-500"${_scopeId}> 読み込み中... </div>`);
            } else {
              _push2(`<form id="network-edit-form" class="space-y-6"${_scopeId}><div class="space-y-4"${_scopeId}>`);
              _push2(ssrRenderComponent(FormInput, mergeProps({
                label: "ネットワーク名",
                name: "network-name",
                modelValue: unref(name),
                "onUpdate:modelValue": ($event) => isRef(name) ? name.value = $event : null
              }, unref(nameAttrs), {
                error: unref(errors).name,
                placeholder: "my-vpc-01",
                required: ""
              }), null, _parent2, _scopeId));
              _push2(ssrRenderComponent(FormInput, {
                label: "ネットワークアドレス (CIDR) ※作成後の変更不可",
                name: "network-cidr",
                "model-value": unref(editedData).cidr,
                class: "bg-gray-100 text-gray-500 cursor-not-allowed",
                readonly: ""
              }, null, _parent2, _scopeId));
              _push2(`<div class="border rounded-md overflow-hidden bg-white mt-6"${_scopeId}><div class="bg-gray-100 px-4 py-2 border-b flex justify-between items-center"${_scopeId}><h3 class="font-bold text-sm text-gray-700"${_scopeId}>サブネット構成</h3><button type="button" class="text-xs bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-2 py-1 rounded shadow-sm transition-colors"${_scopeId}> + 追加 </button></div><div class="p-4 bg-gray-50"${_scopeId}>`);
              if (unref(subnets).length === 0) {
                _push2(`<div class="text-center text-gray-400 py-2 text-sm"${_scopeId}> サブネットがありません。 </div>`);
              } else {
                _push2(`<div class="space-y-3"${_scopeId}><!--[-->`);
                ssrRenderList(unref(subnets), (subnet, index) => {
                  _push2(`<div class="bg-white p-3 rounded border border-gray-200 shadow-sm"${_scopeId}><div class="grid grid-cols-12 gap-3 items-end"${_scopeId}><div class="col-span-5"${_scopeId}>`);
                  _push2(ssrRenderComponent(FormInput, {
                    label: "名前",
                    name: `subnet-name-${index}`,
                    error: getError(index, "name"),
                    modelValue: subnet.value.name,
                    "onUpdate:modelValue": ($event) => subnet.value.name = $event,
                    placeholder: "例: public-subnet",
                    required: ""
                  }, null, _parent2, _scopeId));
                  _push2(`</div><div class="col-span-5"${_scopeId}>`);
                  _push2(ssrRenderComponent(FormInput, {
                    label: "CIDR",
                    name: `subnet-cidr-${index}`,
                    error: getError(index, "cidr"),
                    modelValue: subnet.value.cidr,
                    "onUpdate:modelValue": ($event) => subnet.value.cidr = $event,
                    placeholder: "例: 10.0.1.0/24",
                    required: ""
                  }, null, _parent2, _scopeId));
                  _push2(`</div><div class="col-span-2 flex justify-end pb-3"${_scopeId}><button type="button" class="text-gray-400 hover:text-red-500 p-1 flex items-center gap-1 text-xs" title="削除"${_scopeId}><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"${_scopeId}></path></svg></button></div></div></div>`);
                });
                _push2(`<!--]--></div>`);
              }
              _push2(`</div></div></div></form>`);
            }
          } else {
            return [
              !unref(editedData) ? (openBlock(), createBlock("div", {
                key: 0,
                class: "p-8 text-center text-gray-500"
              }, " 読み込み中... ")) : (openBlock(), createBlock("form", {
                key: 1,
                id: "network-edit-form",
                onSubmit: withModifiers(unref(onSubmit), ["prevent"]),
                class: "space-y-6"
              }, [
                createVNode("div", { class: "space-y-4" }, [
                  createVNode(FormInput, mergeProps({
                    label: "ネットワーク名",
                    name: "network-name",
                    modelValue: unref(name),
                    "onUpdate:modelValue": ($event) => isRef(name) ? name.value = $event : null
                  }, unref(nameAttrs), {
                    error: unref(errors).name,
                    placeholder: "my-vpc-01",
                    required: ""
                  }), null, 16, ["modelValue", "onUpdate:modelValue", "error"]),
                  createVNode(FormInput, {
                    label: "ネットワークアドレス (CIDR) ※作成後の変更不可",
                    name: "network-cidr",
                    "model-value": unref(editedData).cidr,
                    class: "bg-gray-100 text-gray-500 cursor-not-allowed",
                    readonly: ""
                  }, null, 8, ["model-value"]),
                  createVNode("div", { class: "border rounded-md overflow-hidden bg-white mt-6" }, [
                    createVNode("div", { class: "bg-gray-100 px-4 py-2 border-b flex justify-between items-center" }, [
                      createVNode("h3", { class: "font-bold text-sm text-gray-700" }, "サブネット構成"),
                      createVNode("button", {
                        type: "button",
                        onClick: unref(addSubnet),
                        class: "text-xs bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-2 py-1 rounded shadow-sm transition-colors"
                      }, " + 追加 ", 8, ["onClick"])
                    ]),
                    createVNode("div", { class: "p-4 bg-gray-50" }, [
                      unref(subnets).length === 0 ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: "text-center text-gray-400 py-2 text-sm"
                      }, " サブネットがありません。 ")) : (openBlock(), createBlock("div", {
                        key: 1,
                        class: "space-y-3"
                      }, [
                        (openBlock(true), createBlock(Fragment, null, renderList(unref(subnets), (subnet, index) => {
                          return openBlock(), createBlock("div", {
                            key: subnet.key,
                            class: "bg-white p-3 rounded border border-gray-200 shadow-sm"
                          }, [
                            createVNode("div", { class: "grid grid-cols-12 gap-3 items-end" }, [
                              createVNode("div", { class: "col-span-5" }, [
                                createVNode(FormInput, {
                                  label: "名前",
                                  name: `subnet-name-${index}`,
                                  error: getError(index, "name"),
                                  modelValue: subnet.value.name,
                                  "onUpdate:modelValue": ($event) => subnet.value.name = $event,
                                  placeholder: "例: public-subnet",
                                  required: ""
                                }, null, 8, ["name", "error", "modelValue", "onUpdate:modelValue"])
                              ]),
                              createVNode("div", { class: "col-span-5" }, [
                                createVNode(FormInput, {
                                  label: "CIDR",
                                  name: `subnet-cidr-${index}`,
                                  error: getError(index, "cidr"),
                                  modelValue: subnet.value.cidr,
                                  "onUpdate:modelValue": ($event) => subnet.value.cidr = $event,
                                  placeholder: "例: 10.0.1.0/24",
                                  required: ""
                                }, null, 8, ["name", "error", "modelValue", "onUpdate:modelValue"])
                              ]),
                              createVNode("div", { class: "col-span-2 flex justify-end pb-3" }, [
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
              ], 40, ["onSubmit"]))
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/MoVirtualNetworkEdit.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const MoVirtualNetworkEdit = Object.assign(_sfc_main, { __name: "MoVirtualNetworkEdit" });

export { MoVirtualNetworkEdit as M };
//# sourceMappingURL=MoVirtualNetworkEdit-CbOw2k03.mjs.map
