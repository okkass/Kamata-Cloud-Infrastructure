import { _ as _sfc_main$1 } from './BaseModal-XreF1fHA.mjs';
import { U as UiSubmitButton } from './SubmitButton-BLZt3uil.mjs';
import { defineComponent, mergeProps, unref, withCtx, isRef, createVNode, withModifiers, watch, computed, useSSRContext } from 'vue';
import { ssrRenderComponent } from 'vue/server-renderer';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { u as useResourceUpdate } from './useResourceEdit-BDkGI_Ar.mjs';
import { a as ImageUpdateSchema } from './image-SWhs2cAJ.mjs';
import { u as useFormAction } from './useModalAction-CCl6IdMe.mjs';
import { I as IMAGE } from './fetch-kOzZWayB.mjs';
import { F as FormInput } from './Input-jfnKbGQs.mjs';
import { F as FormTextarea } from './Textarea-BGnieQ5E.mjs';

function useImageEditForm(props) {
  const { handleFormSubmit, makeHandleClose: createHandleClose } = useFormAction();
  const { executeUpdate, isUpdating } = useResourceUpdate(IMAGE.name);
  const { errors, handleSubmit, resetForm, defineField, meta } = useForm({
    validationSchema: toTypedSchema(ImageUpdateSchema),
    initialValues: {
      name: "",
      description: ""
    }
  });
  const [name, nameAttrs] = defineField("name");
  const [description, descriptionAttrs] = defineField("description");
  watch(
    () => props.data,
    (newData) => {
      if (props.show && newData) {
        resetForm({
          values: {
            name: newData.name,
            description: newData.description || ""
          }
        });
      }
    },
    { immediate: true, deep: true }
  );
  const onFormSubmit = (emit) => handleFormSubmit(
    handleSubmit,
    {
      // API実行ロジック
      execute: async (payload) => {
        if (!props.data) {
          return { success: false, error: new Error("No image data") };
        }
        return await executeUpdate(props.data.id, payload);
      },
      onSuccessMessage: (values) => `イメージ「${values.name}」を更新しました。`,
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
    description,
    descriptionAttrs,
    isUpdating,
    isValid: computed(() => meta.value.valid),
    makeHandleClose,
    onFormSubmit
  };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "MoImageEdit",
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
      errors,
      name,
      nameAttrs,
      description,
      descriptionAttrs,
      isUpdating,
      isValid,
      onFormSubmit,
      makeHandleClose
    } = useImageEditForm(props);
    const onSubmit = onFormSubmit(emit);
    const handleClose = makeHandleClose(emit);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_BaseModal = _sfc_main$1;
      const _component_UiSubmitButton = UiSubmitButton;
      _push(ssrRenderComponent(_component_BaseModal, mergeProps({
        show: __props.show,
        title: "イメージ編集",
        onClose: unref(handleClose)
      }, _attrs), {
        footer: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="modal-footer"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UiSubmitButton, {
              disabled: !unref(isValid) || unref(isUpdating),
              loading: unref(isUpdating),
              label: "イメージの更新",
              form: "image-edit-form",
              type: "submit"
            }, null, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "modal-footer" }, [
                createVNode(_component_UiSubmitButton, {
                  disabled: !unref(isValid) || unref(isUpdating),
                  loading: unref(isUpdating),
                  label: "イメージの更新",
                  form: "image-edit-form",
                  type: "submit"
                }, null, 8, ["disabled", "loading"])
              ])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<form id="image-edit-form" class="modal-space"${_scopeId}>`);
            _push2(ssrRenderComponent(FormInput, mergeProps({
              label: "イメージ名",
              name: "image-name-edit",
              type: "text",
              modelValue: unref(name),
              "onUpdate:modelValue": ($event) => isRef(name) ? name.value = $event : null
            }, unref(nameAttrs), {
              error: unref(errors).name,
              required: true
            }), null, _parent2, _scopeId));
            _push2(ssrRenderComponent(FormTextarea, mergeProps({
              label: "説明",
              name: "image-description-edit",
              rows: 3,
              modelValue: unref(description),
              "onUpdate:modelValue": ($event) => isRef(description) ? description.value = $event : null
            }, unref(descriptionAttrs), {
              error: unref(errors).description,
              placeholder: "イメージの説明を入力してください"
            }), null, _parent2, _scopeId));
            _push2(`</form>`);
          } else {
            return [
              createVNode("form", {
                id: "image-edit-form",
                onSubmit: withModifiers(unref(onSubmit), ["prevent"]),
                class: "modal-space"
              }, [
                createVNode(FormInput, mergeProps({
                  label: "イメージ名",
                  name: "image-name-edit",
                  type: "text",
                  modelValue: unref(name),
                  "onUpdate:modelValue": ($event) => isRef(name) ? name.value = $event : null
                }, unref(nameAttrs), {
                  error: unref(errors).name,
                  required: true
                }), null, 16, ["modelValue", "onUpdate:modelValue", "error"]),
                createVNode(FormTextarea, mergeProps({
                  label: "説明",
                  name: "image-description-edit",
                  rows: 3,
                  modelValue: unref(description),
                  "onUpdate:modelValue": ($event) => isRef(description) ? description.value = $event : null
                }, unref(descriptionAttrs), {
                  error: unref(errors).description,
                  placeholder: "イメージの説明を入力してください"
                }), null, 16, ["modelValue", "onUpdate:modelValue", "error"])
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/MoImageEdit.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const MoImageEdit = Object.assign(_sfc_main, { __name: "MoImageEdit" });

export { MoImageEdit as M };
//# sourceMappingURL=MoImageEdit-WbfvqdTK.mjs.map
