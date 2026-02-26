import { _ as _sfc_main$1 } from './BaseModal-XreF1fHA.mjs';
import { U as UiSubmitButton } from './SubmitButton-BLZt3uil.mjs';
import { defineComponent, mergeProps, unref, withCtx, isRef, createVNode, withModifiers, computed, useSSRContext } from 'vue';
import { ssrRenderComponent } from 'vue/server-renderer';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { u as useResourceCreate } from './useResourceCreate-C_T3ufwz.mjs';
import { q as convertUnitToByte } from './server.mjs';
import { I as InstanceTypeCreateSchema } from './instance-type-BB8zzCzi.mjs';
import { u as useFormAction } from './useModalAction-CCl6IdMe.mjs';
import { e as INSTANCE_TYPE } from './fetch-kOzZWayB.mjs';
import { F as FormInput } from './Input-jfnKbGQs.mjs';

function useInstanceTypeAddForm() {
  const { handleFormSubmit, makeHandleClose: createHandleClose } = useFormAction();
  const { executeCreate, isCreating } = useResourceCreate(INSTANCE_TYPE.name);
  const { errors, handleSubmit, resetForm, defineField, meta } = useForm({
    validationSchema: toTypedSchema(InstanceTypeCreateSchema),
    // 変換済みのスキーマを渡す
    initialValues: {
      name: "",
      cpuCore: void 0,
      memorySize: void 0
    }
  });
  const [name, nameAttrs] = defineField("name");
  const [cpuCore, cpuCoreAttrs] = defineField("cpuCore");
  const [memorySize, memorySizeAttrs] = defineField("memorySize");
  const onFormSubmit = (emit) => handleFormSubmit(
    handleSubmit,
    {
      // API実行ロジック
      execute: async (payload) => {
        return await executeCreate({
          name: payload.name,
          cpuCore: payload.cpuCore,
          memorySize: convertUnitToByte(payload.memorySize, "MB")
        });
      },
      onSuccessMessage: (values) => `インスタンスタイプ「${values.name}」を作成しました。`,
      onSuccess: () => {
        resetForm();
      },
      emitCloseImmediately: true
    },
    emit
  );
  const makeHandleClose = (emit) => createHandleClose(resetForm, emit);
  return {
    errors,
    name,
    nameAttrs,
    cpuCore,
    cpuCoreAttrs,
    memorySize,
    memorySizeAttrs,
    isCreating,
    isValid: computed(() => meta.value.valid),
    onFormSubmit,
    makeHandleClose
  };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "MoInstanceTypeAdd",
  __ssrInlineRender: true,
  props: { show: { type: Boolean, required: true } },
  emits: ["close", "success"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const {
      errors,
      name,
      cpuCore,
      memorySize,
      nameAttrs,
      cpuCoreAttrs,
      memorySizeAttrs,
      // 状態とアクション
      isCreating,
      isValid,
      onFormSubmit,
      makeHandleClose
    } = useInstanceTypeAddForm();
    const onSubmit = onFormSubmit(emit);
    const handleClose = makeHandleClose(emit);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_BaseModal = _sfc_main$1;
      const _component_UiSubmitButton = UiSubmitButton;
      _push(ssrRenderComponent(_component_BaseModal, mergeProps({
        show: __props.show,
        title: "インスタンスタイプの追加",
        onClose: unref(handleClose)
      }, _attrs), {
        footer: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="modal-footer"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UiSubmitButton, {
              disabled: unref(isCreating) || !unref(isValid),
              loading: unref(isCreating),
              label: "インスタンスタイプを追加",
              type: "submit",
              form: "instance-type-add-form"
            }, null, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "modal-footer" }, [
                createVNode(_component_UiSubmitButton, {
                  disabled: unref(isCreating) || !unref(isValid),
                  loading: unref(isCreating),
                  label: "インスタンスタイプを追加",
                  type: "submit",
                  form: "instance-type-add-form"
                }, null, 8, ["disabled", "loading"])
              ])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<form id="instance-type-add-form" class="modal-space"${_scopeId}>`);
            _push2(ssrRenderComponent(FormInput, mergeProps({
              label: "インスタンスタイプ名",
              name: "instance-type-name",
              type: "text",
              placeholder: "例: standard.xlarge",
              modelValue: unref(name),
              "onUpdate:modelValue": ($event) => isRef(name) ? name.value = $event : null
            }, unref(nameAttrs), {
              error: unref(errors).name,
              required: true
            }), null, _parent2, _scopeId));
            _push2(ssrRenderComponent(FormInput, mergeProps({
              label: "CPUコア数",
              name: "instance-cpu-cores",
              type: "number",
              placeholder: "例: 16",
              modelValue: unref(cpuCore),
              "onUpdate:modelValue": ($event) => isRef(cpuCore) ? cpuCore.value = $event : null,
              modelModifiers: { number: true }
            }, unref(cpuCoreAttrs), {
              error: unref(errors).cpuCore,
              required: true
            }), null, _parent2, _scopeId));
            _push2(ssrRenderComponent(FormInput, mergeProps({
              label: "メモリサイズ",
              name: "instance-memory",
              type: "number",
              placeholder: "例: 4096",
              modelValue: unref(memorySize),
              "onUpdate:modelValue": ($event) => isRef(memorySize) ? memorySize.value = $event : null,
              modelModifiers: { number: true }
            }, unref(memorySizeAttrs), {
              error: unref(errors).memorySize,
              required: true
            }), {
              suffix: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<span class="form-unit-label rounded-l-none -ml-px"${_scopeId2}>MB</span>`);
                } else {
                  return [
                    createVNode("span", { class: "form-unit-label rounded-l-none -ml-px" }, "MB")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</form>`);
          } else {
            return [
              createVNode("form", {
                id: "instance-type-add-form",
                onSubmit: withModifiers(unref(onSubmit), ["prevent"]),
                class: "modal-space"
              }, [
                createVNode(FormInput, mergeProps({
                  label: "インスタンスタイプ名",
                  name: "instance-type-name",
                  type: "text",
                  placeholder: "例: standard.xlarge",
                  modelValue: unref(name),
                  "onUpdate:modelValue": ($event) => isRef(name) ? name.value = $event : null
                }, unref(nameAttrs), {
                  error: unref(errors).name,
                  required: true
                }), null, 16, ["modelValue", "onUpdate:modelValue", "error"]),
                createVNode(FormInput, mergeProps({
                  label: "CPUコア数",
                  name: "instance-cpu-cores",
                  type: "number",
                  placeholder: "例: 16",
                  modelValue: unref(cpuCore),
                  "onUpdate:modelValue": ($event) => isRef(cpuCore) ? cpuCore.value = $event : null,
                  modelModifiers: { number: true }
                }, unref(cpuCoreAttrs), {
                  error: unref(errors).cpuCore,
                  required: true
                }), null, 16, ["modelValue", "onUpdate:modelValue", "error"]),
                createVNode(FormInput, mergeProps({
                  label: "メモリサイズ",
                  name: "instance-memory",
                  type: "number",
                  placeholder: "例: 4096",
                  modelValue: unref(memorySize),
                  "onUpdate:modelValue": ($event) => isRef(memorySize) ? memorySize.value = $event : null,
                  modelModifiers: { number: true }
                }, unref(memorySizeAttrs), {
                  error: unref(errors).memorySize,
                  required: true
                }), {
                  suffix: withCtx(() => [
                    createVNode("span", { class: "form-unit-label rounded-l-none -ml-px" }, "MB")
                  ]),
                  _: 1
                }, 16, ["modelValue", "onUpdate:modelValue", "error"])
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/MoInstanceTypeAdd.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const MoInstanceTypeAdd = Object.assign(_sfc_main, { __name: "MoInstanceTypeAdd" });

export { MoInstanceTypeAdd as M };
//# sourceMappingURL=MoInstanceTypeAdd-joaO4O4s.mjs.map
