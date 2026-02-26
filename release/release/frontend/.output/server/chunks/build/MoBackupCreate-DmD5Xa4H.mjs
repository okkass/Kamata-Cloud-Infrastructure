import { _ as _sfc_main$1 } from './BaseModal-XreF1fHA.mjs';
import { defineComponent, mergeProps, unref, withCtx, isRef, createVNode, withModifiers, computed, watch, useSSRContext } from 'vue';
import { ssrRenderComponent } from 'vue/server-renderer';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { u as useResourceCreate } from './useResourceCreate-C_T3ufwz.mjs';
import { u as useResourceList } from './useResourceList-BY3jHLdB.mjs';
import { u as useFormAction } from './useModalAction-CCl6IdMe.mjs';
import * as z from 'zod';
import { a as MACHINE, B as BACKUP } from './fetch-kOzZWayB.mjs';
import { F as FormInput } from './Input-jfnKbGQs.mjs';
import { F as FormSelect } from './Select-Cb_WFau-.mjs';
import { U as UiSubmitButton } from './SubmitButton-BLZt3uil.mjs';

const BackupCreateSchema = z.object({
  name: z.string().min(1, "バックアップ名は必須です。"),
  targetVirtualMachineId: z.string({ message: "仮想マシンは必須です。" }).min(1, "仮想マシンは必須です。"),
  targetStorageId: z.string({ message: "ストレージは必須です。" }).min(1, "ストレージは必須です。")
});
function useBackupCreateForm(emit) {
  const { handleFormSubmit, makeHandleClose } = useFormAction();
  const { errors, defineField, handleSubmit, setFieldValue, meta, resetForm } = useForm({
    validationSchema: toTypedSchema(BackupCreateSchema),
    initialValues: {
      name: "",
      targetVirtualMachineId: "",
      targetStorageId: ""
    }
  });
  const [name, nameAttrs] = defineField("name");
  const [targetVirtualMachineId, targetVirtualMachineIdAttrs] = defineField(
    "targetVirtualMachineId"
  );
  const [targetStorageId, targetStorageIdAttrs] = defineField("targetStorageId");
  const {
    data: vms,
    pending: vmsPending,
    error: vmsError
  } = useResourceList(MACHINE.name);
  const availableStorages = computed(() => {
    const selectedVm = vms.value?.find(
      (vm) => vm.id === targetVirtualMachineId.value
    );
    return selectedVm?.storages?.filter((s) => !!s) ?? [];
  });
  watch(
    () => targetVirtualMachineId.value,
    () => {
      setFieldValue("targetStorageId", "");
    }
  );
  const { executeCreate, isCreating } = useResourceCreate(BACKUP.name);
  const onFormSubmit = (emit2) => handleFormSubmit(
    handleSubmit,
    {
      execute: async (formValues) => {
        const payload = {
          name: formValues.name,
          targetVirtualMachineId: formValues.targetVirtualMachineId,
          targetStorageId: formValues.targetStorageId
        };
        const result = await executeCreate(payload);
        return result;
      },
      onSuccess: () => {
        resetForm();
      },
      onSuccessMessage: (payload) => `バックアップ「${payload.name}」を作成しました。`,
      emitCloseImmediately: true
    },
    emit2
  );
  const makehandleClose = (emit2) => makeHandleClose(resetForm, emit2);
  return {
    name,
    nameAttrs,
    targetVirtualMachineId,
    targetVirtualMachineIdAttrs,
    targetStorageId,
    targetStorageIdAttrs,
    errors,
    isValid: computed(() => meta.value.valid),
    vms,
    vmsPending,
    vmsError,
    availableStorages,
    isCreating,
    onFormSubmit,
    makehandleClose
  };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "MoBackupCreate",
  __ssrInlineRender: true,
  props: {
    show: { type: Boolean }
  },
  emits: ["close", "success"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const {
      name,
      nameAttrs,
      targetVirtualMachineId,
      targetVirtualMachineIdAttrs,
      targetStorageId,
      targetStorageIdAttrs,
      errors,
      isValid,
      vms,
      vmsPending,
      vmsError,
      availableStorages,
      isCreating,
      onFormSubmit,
      makehandleClose
    } = useBackupCreateForm();
    const handleClose = makehandleClose(emit);
    const onSubmit = onFormSubmit(emit);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_BaseModal = _sfc_main$1;
      _push(ssrRenderComponent(_component_BaseModal, mergeProps({
        show: __props.show,
        title: "バックアップ作成",
        onClose: unref(handleClose)
      }, _attrs), {
        footer: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="modal-footer"${_scopeId}>`);
            _push2(ssrRenderComponent(UiSubmitButton, {
              form: "backup-create-form",
              type: "submit",
              label: "バックアップを作成",
              loading: unref(isCreating),
              disabled: unref(isCreating) || !unref(isValid)
            }, null, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "modal-footer" }, [
                createVNode(UiSubmitButton, {
                  form: "backup-create-form",
                  type: "submit",
                  label: "バックアップを作成",
                  loading: unref(isCreating),
                  disabled: unref(isCreating) || !unref(isValid)
                }, null, 8, ["loading", "disabled"])
              ])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<form id="backup-create-form" class="modal-space"${_scopeId}>`);
            _push2(ssrRenderComponent(FormInput, mergeProps({
              label: "バックアップ名",
              name: "backup-name",
              modelValue: unref(name),
              "onUpdate:modelValue": ($event) => isRef(name) ? name.value = $event : null
            }, unref(nameAttrs), {
              error: unref(errors).name,
              placeholder: "例: backup-vm-01",
              required: ""
            }), null, _parent2, _scopeId));
            _push2(ssrRenderComponent(FormSelect, mergeProps({
              label: "対象の仮想マシン",
              name: "target-virtual-machine",
              modelValue: unref(targetVirtualMachineId),
              "onUpdate:modelValue": ($event) => isRef(targetVirtualMachineId) ? targetVirtualMachineId.value = $event : null
            }, unref(targetVirtualMachineIdAttrs), {
              options: unref(vms) ?? [],
              "option-value": "id",
              "option-label": "name",
              pending: unref(vmsPending),
              error: !!unref(vmsError),
              "error-message": unref(errors).targetVirtualMachineId,
              required: ""
            }), null, _parent2, _scopeId));
            _push2(ssrRenderComponent(FormSelect, mergeProps({
              label: "対象のストレージ",
              name: "target-storage",
              modelValue: unref(targetStorageId),
              "onUpdate:modelValue": ($event) => isRef(targetStorageId) ? targetStorageId.value = $event : null
            }, unref(targetStorageIdAttrs), {
              options: unref(availableStorages),
              "option-value": "id",
              "option-label": "name",
              disabled: !unref(targetVirtualMachineId) || unref(availableStorages).length === 0,
              "error-message": unref(errors).targetStorageId,
              required: ""
            }), null, _parent2, _scopeId));
            _push2(`</form>`);
          } else {
            return [
              createVNode("form", {
                id: "backup-create-form",
                onSubmit: withModifiers(unref(onSubmit), ["prevent"]),
                class: "modal-space"
              }, [
                createVNode(FormInput, mergeProps({
                  label: "バックアップ名",
                  name: "backup-name",
                  modelValue: unref(name),
                  "onUpdate:modelValue": ($event) => isRef(name) ? name.value = $event : null
                }, unref(nameAttrs), {
                  error: unref(errors).name,
                  placeholder: "例: backup-vm-01",
                  required: ""
                }), null, 16, ["modelValue", "onUpdate:modelValue", "error"]),
                createVNode(FormSelect, mergeProps({
                  label: "対象の仮想マシン",
                  name: "target-virtual-machine",
                  modelValue: unref(targetVirtualMachineId),
                  "onUpdate:modelValue": ($event) => isRef(targetVirtualMachineId) ? targetVirtualMachineId.value = $event : null
                }, unref(targetVirtualMachineIdAttrs), {
                  options: unref(vms) ?? [],
                  "option-value": "id",
                  "option-label": "name",
                  pending: unref(vmsPending),
                  error: !!unref(vmsError),
                  "error-message": unref(errors).targetVirtualMachineId,
                  required: ""
                }), null, 16, ["modelValue", "onUpdate:modelValue", "options", "pending", "error", "error-message"]),
                createVNode(FormSelect, mergeProps({
                  label: "対象のストレージ",
                  name: "target-storage",
                  modelValue: unref(targetStorageId),
                  "onUpdate:modelValue": ($event) => isRef(targetStorageId) ? targetStorageId.value = $event : null
                }, unref(targetStorageIdAttrs), {
                  options: unref(availableStorages),
                  "option-value": "id",
                  "option-label": "name",
                  disabled: !unref(targetVirtualMachineId) || unref(availableStorages).length === 0,
                  "error-message": unref(errors).targetStorageId,
                  required: ""
                }), null, 16, ["modelValue", "onUpdate:modelValue", "options", "disabled", "error-message"])
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/MoBackupCreate.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const MoBackupCreate = Object.assign(_sfc_main, { __name: "MoBackupCreate" });

export { MoBackupCreate as M };
//# sourceMappingURL=MoBackupCreate-DmD5Xa4H.mjs.map
