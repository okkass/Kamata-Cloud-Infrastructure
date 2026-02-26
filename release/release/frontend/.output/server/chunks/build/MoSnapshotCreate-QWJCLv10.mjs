import { _ as _sfc_main$1 } from './BaseModal-XreF1fHA.mjs';
import { defineComponent, mergeProps, unref, withCtx, isRef, createVNode, withModifiers, computed, useSSRContext } from 'vue';
import { ssrRenderComponent } from 'vue/server-renderer';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { u as useResourceCreate } from './useResourceCreate-C_T3ufwz.mjs';
import { u as useResourceList } from './useResourceList-BY3jHLdB.mjs';
import { u as useFormAction } from './useModalAction-CCl6IdMe.mjs';
import * as z from 'zod';
import { a as MACHINE, S as SNAPSHOT } from './fetch-kOzZWayB.mjs';
import { F as FormInput } from './Input-jfnKbGQs.mjs';
import { F as FormTextarea } from './Textarea-BGnieQ5E.mjs';
import { F as FormSelect } from './Select-Cb_WFau-.mjs';
import { U as UiSubmitButton } from './SubmitButton-BLZt3uil.mjs';

const snapshotCreateSchema = z.object({
  name: z.string().min(1, "スナップショット名は必須です。"),
  targetVmId: z.string().min(1, "仮想マシンは必須です。"),
  description: z.string().optional()
});
function useSnapshotCreateForm(emit) {
  const { handleFormSubmit, makeHandleClose } = useFormAction();
  const { executeCreate, isCreating } = useResourceCreate(SNAPSHOT.name);
  const {
    data: virtualMachines,
    pending: vmsPending,
    error: vmsError
  } = useResourceList(MACHINE.name);
  const { errors, handleSubmit, defineField, meta, resetForm } = useForm({
    validationSchema: toTypedSchema(snapshotCreateSchema),
    initialValues: {
      name: "",
      targetVmId: "",
      description: ""
    }
  });
  const [name, nameAttrs] = defineField("name");
  const [targetVmId, targetVmIdAttrs] = defineField("targetVmId");
  const [description, descriptionAttrs] = defineField("description");
  const onFormSubmit = (emit2) => handleFormSubmit(
    handleSubmit,
    {
      execute: async (values) => {
        const payload = {
          name: values.name,
          targetVmId: values.targetVmId,
          description: values.description
        };
        return await executeCreate(payload);
      },
      onSuccess: () => {
        resetForm();
      },
      onSuccessMessage: (payload) => `スナップショット「${payload.name}」を作成しました。`,
      emitCloseImmediately: true
    },
    emit2
  );
  const makehandleClose = (emit2) => makeHandleClose(resetForm, emit2);
  return {
    errors,
    name,
    nameAttrs,
    targetVmId,
    targetVmIdAttrs,
    description,
    descriptionAttrs,
    virtualMachines,
    vmsPending,
    vmsError,
    isCreating,
    isValid: computed(() => meta.value.valid),
    onFormSubmit,
    makehandleClose
  };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "MoSnapshotCreate",
  __ssrInlineRender: true,
  props: { show: { type: Boolean, required: true } },
  emits: ["close", "success"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const {
      errors,
      name,
      nameAttrs,
      targetVmId,
      description,
      descriptionAttrs,
      virtualMachines,
      vmsPending,
      vmsError,
      isCreating,
      isValid,
      onFormSubmit,
      makehandleClose
    } = useSnapshotCreateForm();
    const handleClose = makehandleClose(emit);
    const onSubmit = onFormSubmit(emit);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_BaseModal = _sfc_main$1;
      _push(ssrRenderComponent(_component_BaseModal, mergeProps({
        show: __props.show,
        title: "スナップショット作成",
        onClose: unref(handleClose)
      }, _attrs), {
        footer: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="modal-footer"${_scopeId}>`);
            _push2(ssrRenderComponent(UiSubmitButton, {
              disabled: unref(isCreating) || !unref(isValid),
              loading: unref(isCreating),
              label: "スナップショットを作成",
              form: "snapshot-create-form",
              type: "submit"
            }, null, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "modal-footer" }, [
                createVNode(UiSubmitButton, {
                  disabled: unref(isCreating) || !unref(isValid),
                  loading: unref(isCreating),
                  label: "スナップショットを作成",
                  form: "snapshot-create-form",
                  type: "submit"
                }, null, 8, ["disabled", "loading"])
              ])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<form id="snapshot-create-form" class="space-y-6"${_scopeId}><div class="space-y-4"${_scopeId}>`);
            _push2(ssrRenderComponent(FormInput, mergeProps({
              label: "スナップショット名",
              name: "snapshot-name",
              type: "text",
              modelValue: unref(name),
              "onUpdate:modelValue": ($event) => isRef(name) ? name.value = $event : null
            }, unref(nameAttrs), {
              error: unref(errors).name,
              required: true,
              placeholder: "例: backup-before-update"
            }), null, _parent2, _scopeId));
            _push2(ssrRenderComponent(FormSelect, {
              label: "対象仮想マシン",
              name: "snapshot-vm",
              options: unref(virtualMachines) ?? [],
              "option-label": "name",
              "option-value": "id",
              placeholder: "仮想マシンを選択してください",
              required: true,
              pending: unref(vmsPending),
              error: unref(vmsError),
              "error-message": unref(errors).targetVmId,
              modelValue: unref(targetVmId),
              "onUpdate:modelValue": ($event) => isRef(targetVmId) ? targetVmId.value = $event : null
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(FormTextarea, mergeProps({
              label: "説明",
              name: "snapshot-description",
              rows: 3,
              modelValue: unref(description),
              "onUpdate:modelValue": ($event) => isRef(description) ? description.value = $event : null
            }, unref(descriptionAttrs), {
              error: unref(errors).description,
              placeholder: "スナップショットの説明を入力してください"
            }), null, _parent2, _scopeId));
            _push2(`</div></form>`);
          } else {
            return [
              createVNode("form", {
                id: "snapshot-create-form",
                onSubmit: withModifiers(unref(onSubmit), ["prevent"]),
                class: "space-y-6"
              }, [
                createVNode("div", { class: "space-y-4" }, [
                  createVNode(FormInput, mergeProps({
                    label: "スナップショット名",
                    name: "snapshot-name",
                    type: "text",
                    modelValue: unref(name),
                    "onUpdate:modelValue": ($event) => isRef(name) ? name.value = $event : null
                  }, unref(nameAttrs), {
                    error: unref(errors).name,
                    required: true,
                    placeholder: "例: backup-before-update"
                  }), null, 16, ["modelValue", "onUpdate:modelValue", "error"]),
                  createVNode(FormSelect, {
                    label: "対象仮想マシン",
                    name: "snapshot-vm",
                    options: unref(virtualMachines) ?? [],
                    "option-label": "name",
                    "option-value": "id",
                    placeholder: "仮想マシンを選択してください",
                    required: true,
                    pending: unref(vmsPending),
                    error: unref(vmsError),
                    "error-message": unref(errors).targetVmId,
                    modelValue: unref(targetVmId),
                    "onUpdate:modelValue": ($event) => isRef(targetVmId) ? targetVmId.value = $event : null
                  }, null, 8, ["options", "pending", "error", "error-message", "modelValue", "onUpdate:modelValue"]),
                  createVNode(FormTextarea, mergeProps({
                    label: "説明",
                    name: "snapshot-description",
                    rows: 3,
                    modelValue: unref(description),
                    "onUpdate:modelValue": ($event) => isRef(description) ? description.value = $event : null
                  }, unref(descriptionAttrs), {
                    error: unref(errors).description,
                    placeholder: "スナップショットの説明を入力してください"
                  }), null, 16, ["modelValue", "onUpdate:modelValue", "error"])
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/MoSnapshotCreate.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const MoSnapshotCreate = Object.assign(_sfc_main, { __name: "MoSnapshotCreate" });

export { MoSnapshotCreate as M };
//# sourceMappingURL=MoSnapshotCreate-QWJCLv10.mjs.map
