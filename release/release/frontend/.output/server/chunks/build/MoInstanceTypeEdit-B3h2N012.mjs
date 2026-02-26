import { _ as _sfc_main$1 } from './BaseModal-XreF1fHA.mjs';
import { U as UiSubmitButton } from './SubmitButton-BLZt3uil.mjs';
import { defineComponent, mergeProps, unref, withCtx, isRef, createVNode, createBlock, openBlock, withModifiers, createCommentVNode, toDisplayString, watch, computed, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { u as useResourceUpdater } from './useResourceUpdater-D_YM1lnm.mjs';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { a as InstanceTypeUpdateSchema } from './instance-type-BB8zzCzi.mjs';
import { u as useFormAction } from './useModalAction-CCl6IdMe.mjs';
import { u as useToast, q as convertUnitToByte, c as convertByteToUnit } from './server.mjs';
import { F as FormInput } from './Input-jfnKbGQs.mjs';

const useInstanceTypeEditForm = (props) => {
  const { handleFormSubmit, makeHandleClose } = useFormAction();
  useToast();
  const {
    editedData,
    dirtyState,
    isSaving,
    init,
    save: updaterSave,
    errorMessage
  } = useResourceUpdater();
  const updaterError = errorMessage;
  const { errors, defineField, handleSubmit, resetForm, meta } = useForm({
    validationSchema: toTypedSchema(InstanceTypeUpdateSchema)
  });
  const [name, nameAttrs] = defineField("name");
  const [cpuCore, cpuCoreAttrs] = defineField("cpuCore");
  const [memorySizeField, memorySizeAttrs] = defineField("memorySize");
  const initializeForm = (data) => {
    const config = {
      base: {
        endpoint: `instance-types/${data.id}`,
        fields: ["name", "cpuCore", "memorySize"]
      }
    };
    init(data, config);
    resetForm({
      values: {
        name: data.name,
        cpuCore: data.cpuCore,
        memorySize: convertByteToUnit(data.memorySize, "MB", false)
      }
    });
  };
  watch(
    () => [props.show, props.data],
    ([show, data]) => {
      if (show && data) {
        initializeForm(data);
      }
    },
    { immediate: true }
  );
  watch(
    () => ({
      name: name.value,
      cpuCore: cpuCore.value,
      memorySize: memorySizeField.value
    }),
    (newValues) => {
      if (editedData.value) {
        editedData.value.name = newValues.name;
        editedData.value.cpuCore = newValues.cpuCore;
        if (newValues.memorySize != null) {
          editedData.value.memorySize = convertUnitToByte(
            newValues.memorySize,
            "MB"
          );
        }
      }
    },
    { deep: true }
  );
  const save = (emit) => handleFormSubmit(
    handleSubmit,
    {
      execute: async () => {
        const success = await updaterSave();
        return { success };
      },
      onSuccess: () => {
        resetForm();
      },
      onSuccessMessage: () => `インスタンスタイプ「${name.value}」を更新しました。`,
      emitCloseImmediately: true
    },
    emit
  );
  const close = (emit) => makeHandleClose(resetForm, emit);
  return {
    editedData,
    // バリデーション用フィールド
    name,
    nameAttrs,
    cpuCore,
    cpuCoreAttrs,
    memorySizeField,
    memorySizeAttrs,
    errors,
    dirtyState,
    // [推奨]: dirtyState を公開
    isSaving,
    updaterError,
    isValid: computed(() => meta.value.valid),
    save,
    close
  };
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "MoInstanceTypeEdit",
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
    const {
      editedData,
      name,
      nameAttrs,
      cpuCore,
      cpuCoreAttrs,
      memorySizeField,
      memorySizeAttrs,
      errors,
      isSaving,
      updaterError,
      isValid,
      save,
      close
    } = useInstanceTypeEditForm(props);
    const onSubmit = save(emit);
    const handleClose = close(emit);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_BaseModal = _sfc_main$1;
      const _component_UiSubmitButton = UiSubmitButton;
      _push(ssrRenderComponent(_component_BaseModal, mergeProps({
        show: __props.show,
        title: "インスタンスタイプ編集",
        onClose: unref(handleClose),
        size: "md"
      }, _attrs), {
        footer: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="modal-footer"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UiSubmitButton, {
              disabled: unref(isSaving) || !unref(isValid),
              loading: unref(isSaving),
              label: "インスタンスタイプを更新",
              form: "instance-type-edit-form",
              type: "submit"
            }, null, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "modal-footer" }, [
                createVNode(_component_UiSubmitButton, {
                  disabled: unref(isSaving) || !unref(isValid),
                  loading: unref(isSaving),
                  label: "インスタンスタイプを更新",
                  form: "instance-type-edit-form",
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
              _push2(`<form class="space-y-6" id="instance-type-edit-form"${_scopeId}>`);
              if (unref(updaterError)) {
                _push2(`<div class="bg-red-50 text-red-600 p-3 rounded text-sm"${_scopeId}>${ssrInterpolate(unref(updaterError))}</div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`<div class="space-y-4"${_scopeId}>`);
              _push2(ssrRenderComponent(FormInput, mergeProps({
                label: "名前",
                name: "name",
                modelValue: unref(name),
                "onUpdate:modelValue": ($event) => isRef(name) ? name.value = $event : null
              }, unref(nameAttrs), {
                error: unref(errors).name,
                placeholder: "例: standard-2vcpu-4gb",
                required: "",
                class: "w-full"
              }), null, _parent2, _scopeId));
              _push2(ssrRenderComponent(FormInput, mergeProps({
                label: "vCPU",
                name: "cpuCore",
                type: "number",
                modelValue: unref(cpuCore),
                "onUpdate:modelValue": ($event) => isRef(cpuCore) ? cpuCore.value = $event : null,
                modelModifiers: { number: true }
              }, unref(cpuCoreAttrs), {
                error: unref(errors).cpuCore,
                placeholder: "2",
                required: "",
                class: "w-full"
              }), null, _parent2, _scopeId));
              _push2(ssrRenderComponent(FormInput, mergeProps({
                label: "メモリ (MB)",
                name: "memorySize",
                type: "number",
                modelValue: unref(memorySizeField),
                "onUpdate:modelValue": ($event) => isRef(memorySizeField) ? memorySizeField.value = $event : null,
                modelModifiers: { number: true }
              }, unref(memorySizeAttrs), {
                error: unref(errors).memorySize,
                placeholder: "4",
                step: 1024,
                min: 1,
                required: "",
                class: "w-full"
              }), {
                suffix: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`<span class="ml-2 text-gray-500 text-sm"${_scopeId2}>MB</span>`);
                  } else {
                    return [
                      createVNode("span", { class: "ml-2 text-gray-500 text-sm" }, "MB")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</div></form>`);
            }
          } else {
            return [
              !unref(editedData) ? (openBlock(), createBlock("div", {
                key: 0,
                class: "p-8 text-center text-gray-500"
              }, " 読み込み中... ")) : (openBlock(), createBlock("form", {
                key: 1,
                onSubmit: withModifiers(unref(onSubmit), ["prevent"]),
                class: "space-y-6",
                id: "instance-type-edit-form"
              }, [
                unref(updaterError) ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "bg-red-50 text-red-600 p-3 rounded text-sm"
                }, toDisplayString(unref(updaterError)), 1)) : createCommentVNode("", true),
                createVNode("div", { class: "space-y-4" }, [
                  createVNode(FormInput, mergeProps({
                    label: "名前",
                    name: "name",
                    modelValue: unref(name),
                    "onUpdate:modelValue": ($event) => isRef(name) ? name.value = $event : null
                  }, unref(nameAttrs), {
                    error: unref(errors).name,
                    placeholder: "例: standard-2vcpu-4gb",
                    required: "",
                    class: "w-full"
                  }), null, 16, ["modelValue", "onUpdate:modelValue", "error"]),
                  createVNode(FormInput, mergeProps({
                    label: "vCPU",
                    name: "cpuCore",
                    type: "number",
                    modelValue: unref(cpuCore),
                    "onUpdate:modelValue": ($event) => isRef(cpuCore) ? cpuCore.value = $event : null,
                    modelModifiers: { number: true }
                  }, unref(cpuCoreAttrs), {
                    error: unref(errors).cpuCore,
                    placeholder: "2",
                    required: "",
                    class: "w-full"
                  }), null, 16, ["modelValue", "onUpdate:modelValue", "error"]),
                  createVNode(FormInput, mergeProps({
                    label: "メモリ (MB)",
                    name: "memorySize",
                    type: "number",
                    modelValue: unref(memorySizeField),
                    "onUpdate:modelValue": ($event) => isRef(memorySizeField) ? memorySizeField.value = $event : null,
                    modelModifiers: { number: true }
                  }, unref(memorySizeAttrs), {
                    error: unref(errors).memorySize,
                    placeholder: "4",
                    step: 1024,
                    min: 1,
                    required: "",
                    class: "w-full"
                  }), {
                    suffix: withCtx(() => [
                      createVNode("span", { class: "ml-2 text-gray-500 text-sm" }, "MB")
                    ]),
                    _: 1
                  }, 16, ["modelValue", "onUpdate:modelValue", "error"])
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/MoInstanceTypeEdit.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const MoInstanceTypeEdit = Object.assign(_sfc_main, { __name: "MoInstanceTypeEdit" });

export { MoInstanceTypeEdit as M };
//# sourceMappingURL=MoInstanceTypeEdit-B3h2N012.mjs.map
