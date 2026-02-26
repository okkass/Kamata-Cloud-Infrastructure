import { _ as _sfc_main$1 } from './BaseModal-XreF1fHA.mjs';
import { defineComponent, mergeProps, unref, withCtx, isRef, createVNode, withModifiers, watch, computed, useSSRContext } from 'vue';
import { ssrRenderComponent } from 'vue/server-renderer';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { u as useResourceUpdater } from './useResourceUpdater-D_YM1lnm.mjs';
import { u as useFormAction } from './useModalAction-CCl6IdMe.mjs';
import { a as StorageEditSchema } from './storage-mOgjHrQq.mjs';
import { u as useToast } from './server.mjs';
import { F as FormInput } from './Input-jfnKbGQs.mjs';
import { F as FormSelect } from './Select-Cb_WFau-.mjs';
import { U as UiSubmitButton } from './SubmitButton-BLZt3uil.mjs';

const validationSchema = toTypedSchema(StorageEditSchema);
function useStorageEditForm(props) {
  const { handleFormSubmit, makeHandleClose } = useFormAction();
  const { addToast } = useToast();
  const { editedData, init, save, isDirty, isSaving } = useResourceUpdater();
  const { errors, handleSubmit, defineField, meta, resetForm, setValues } = useForm({
    validationSchema,
    initialValues: {
      name: "",
      hasNetworkAccess: "false"
    }
  });
  const [name, nameAttrs] = defineField("name");
  const [hasNetworkAccess, hasNetworkAccessAttrs] = defineField("hasNetworkAccess");
  watch(
    () => [props.show, props.data],
    ([show, data]) => {
      if (show && data) {
        init(data, getResourceConfig(data));
        setValues({
          name: data.name,
          hasNetworkAccess: String(data.hasNetworkAccess)
        });
      }
    },
    { immediate: true }
  );
  function getResourceConfig(data) {
    return {
      base: {
        endpoint: `storage-pools/${data.id}`,
        fields: ["name", "hasNetworkAccess"]
      }
    };
  }
  watch(
    () => ({ name: name.value, hasNetworkAccess: hasNetworkAccess.value }),
    (newValues) => {
      if (editedData.value) {
        editedData.value.name = newValues.name;
        editedData.value.hasNetworkAccess = newValues.hasNetworkAccess === "true";
      }
    },
    { deep: true }
  );
  const onFormSubmit = (emit) => {
    const submitHandler = handleFormSubmit(
      handleSubmit,
      {
        execute: async () => {
          const success = await save();
          return { success };
        },
        onSuccess: () => {
          resetForm();
        },
        onSuccessMessage: () => `ストレージプール「${name.value}」を更新しました。`,
        emitCloseImmediately: true
      },
      emit
    );
    return async (e) => {
      if (!isDirty.value) {
        addToast({
          message: "変更がありません。",
          type: "info"
        });
        return;
      }
      return submitHandler(e);
    };
  };
  const makehandleClose = (emit) => makeHandleClose(resetForm, emit);
  return {
    errors,
    name,
    nameAttrs,
    hasNetworkAccess,
    hasNetworkAccessAttrs,
    isDirty,
    isValid: computed(() => meta.value.valid),
    isSaving,
    onFormSubmit,
    makehandleClose
  };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "MoStorageEdit",
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
      hasNetworkAccess,
      hasNetworkAccessAttrs,
      isValid,
      isSaving,
      onFormSubmit,
      makehandleClose
    } = useStorageEditForm(props);
    const networkOptions = [
      { id: "true", name: "許可 (True)" },
      { id: "false", name: "拒否 (False)" }
    ];
    const submitForm = onFormSubmit(emit);
    const handleClose = makehandleClose(emit);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_BaseModal = _sfc_main$1;
      _push(ssrRenderComponent(_component_BaseModal, mergeProps({
        show: __props.show,
        title: "ストレージプール編集",
        onClose: unref(handleClose)
      }, _attrs), {
        footer: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="modal-footer"${_scopeId}>`);
            _push2(ssrRenderComponent(UiSubmitButton, {
              disabled: unref(isSaving) || !unref(isValid),
              loading: unref(isSaving),
              label: "ストレージプールを更新",
              form: "storage-edit-form",
              type: "submit"
            }, null, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "modal-footer" }, [
                createVNode(UiSubmitButton, {
                  disabled: unref(isSaving) || !unref(isValid),
                  loading: unref(isSaving),
                  label: "ストレージプールを更新",
                  form: "storage-edit-form",
                  type: "submit"
                }, null, 8, ["disabled", "loading"])
              ])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<form id="storage-edit-form" class="space-y-6"${_scopeId}><div class="space-y-4"${_scopeId}>`);
            _push2(ssrRenderComponent(FormInput, mergeProps({
              label: "プール名",
              name: "storage-name-edit",
              type: "text",
              modelValue: unref(name),
              "onUpdate:modelValue": ($event) => isRef(name) ? name.value = $event : null
            }, unref(nameAttrs), {
              error: unref(errors).name,
              required: true
            }), null, _parent2, _scopeId));
            _push2(ssrRenderComponent(FormSelect, mergeProps({
              label: "ネットワークアクセス",
              name: "storage-network-edit",
              options: networkOptions,
              required: true,
              "error-message": unref(errors).hasNetworkAccess,
              modelValue: unref(hasNetworkAccess),
              "onUpdate:modelValue": ($event) => isRef(hasNetworkAccess) ? hasNetworkAccess.value = $event : null
            }, unref(hasNetworkAccessAttrs)), null, _parent2, _scopeId));
            _push2(`</div></form>`);
          } else {
            return [
              createVNode("form", {
                id: "storage-edit-form",
                onSubmit: withModifiers(unref(submitForm), ["prevent"]),
                class: "space-y-6"
              }, [
                createVNode("div", { class: "space-y-4" }, [
                  createVNode(FormInput, mergeProps({
                    label: "プール名",
                    name: "storage-name-edit",
                    type: "text",
                    modelValue: unref(name),
                    "onUpdate:modelValue": ($event) => isRef(name) ? name.value = $event : null
                  }, unref(nameAttrs), {
                    error: unref(errors).name,
                    required: true
                  }), null, 16, ["modelValue", "onUpdate:modelValue", "error"]),
                  createVNode(FormSelect, mergeProps({
                    label: "ネットワークアクセス",
                    name: "storage-network-edit",
                    options: networkOptions,
                    required: true,
                    "error-message": unref(errors).hasNetworkAccess,
                    modelValue: unref(hasNetworkAccess),
                    "onUpdate:modelValue": ($event) => isRef(hasNetworkAccess) ? hasNetworkAccess.value = $event : null
                  }, unref(hasNetworkAccessAttrs)), null, 16, ["error-message", "modelValue", "onUpdate:modelValue"])
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/MoStorageEdit.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const MoStorageEdit = Object.assign(_sfc_main, { __name: "MoStorageEdit" });

export { MoStorageEdit as M };
//# sourceMappingURL=MoStorageEdit-DpWdngYi.mjs.map
