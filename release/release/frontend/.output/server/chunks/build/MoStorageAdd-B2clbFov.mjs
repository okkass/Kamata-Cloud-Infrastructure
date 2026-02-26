import { _ as _sfc_main$1 } from './BaseModal-XreF1fHA.mjs';
import { defineComponent, mergeProps, unref, withCtx, isRef, createVNode, withModifiers, createBlock, createCommentVNode, openBlock, ref, watch, computed, useSSRContext } from 'vue';
import { ssrRenderComponent } from 'vue/server-renderer';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { u as useResourceCreate } from './useResourceCreate-C_T3ufwz.mjs';
import { u as useResourceList } from './useResourceList-BY3jHLdB.mjs';
import { u as useApiClient } from './useResourceClient-CRkQUuKV.mjs';
import { u as useFormAction } from './useModalAction-CCl6IdMe.mjs';
import { S as StorageAddSchema } from './storage-mOgjHrQq.mjs';
import { N as NODE, d as STORAGE } from './fetch-kOzZWayB.mjs';
import { F as FormInput } from './Input-jfnKbGQs.mjs';
import { F as FormSelect } from './Select-Cb_WFau-.mjs';
import { U as UiSubmitButton } from './SubmitButton-BLZt3uil.mjs';

const validationSchema = toTypedSchema(StorageAddSchema);
function useStorageAddForm() {
  const api = useApiClient();
  const { handleFormSubmit, makeHandleClose } = useFormAction();
  const { executeCreate, isCreating } = useResourceCreate(STORAGE.name);
  const {
    data: nodes,
    pending: nodesPending,
    error: nodesError
  } = useResourceList(NODE.name);
  const { errors, handleSubmit, resetForm, defineField, values, meta } = useForm({
    validationSchema,
    initialValues: {
      name: "",
      nodeId: "",
      devicePath: "",
      hasNetworkAccess: "false"
    }
  });
  const [name, nameAttrs] = defineField("name");
  const [nodeId, nodeAttrs] = defineField("nodeId");
  const [devicePath, devicePathAttrs] = defineField("devicePath");
  const [hasNetworkAccess, hasNetworkAccessAttrs] = defineField("hasNetworkAccess");
  const devices = ref([]);
  const devicesPending = ref(false);
  const devicesError = ref(null);
  watch(
    () => values.nodeId,
    async (newNodeId) => {
      if (!newNodeId) {
        devices.value = [];
        return;
      }
      const targetId = typeof newNodeId === "object" ? newNodeId.id : newNodeId;
      devicesPending.value = true;
      devicesError.value = null;
      try {
        const response = await api.get(
          `${NODE.name}/${targetId}/new-devices`
        );
        devices.value = response || [];
      } catch (err) {
        console.error("デバイス一覧取得エラー:", err);
        devicesError.value = err;
        devices.value = [];
      } finally {
        devicesPending.value = false;
      }
    }
  );
  const deviceOptions = computed(() => {
    return devices.value.map((d) => ({
      id: d.devicePath,
      name: d.devicePath
    }));
  });
  const onFormSubmit = (emit) => handleFormSubmit(
    handleSubmit,
    {
      execute: async (formValues) => {
        const payload = {
          name: formValues.name,
          nodeId: formValues.nodeId,
          devicePath: formValues.devicePath,
          hasNetworkAccess: formValues.hasNetworkAccess === "true"
        };
        return await executeCreate(payload);
      },
      onSuccess: () => {
        resetForm();
      },
      onSuccessMessage: (payload) => `ストレージプール「${payload.name}」を作成しました。`,
      emitCloseImmediately: true
    },
    emit
  );
  const makehandleClose = (emit) => makeHandleClose(resetForm, emit);
  return {
    errors,
    name,
    nameAttrs,
    nodeId,
    nodeAttrs,
    devicePath,
    devicePathAttrs,
    hasNetworkAccess,
    hasNetworkAccessAttrs,
    nodes,
    nodesPending,
    nodesError,
    deviceOptions,
    devicesPending,
    devicesError,
    isValid: computed(() => meta.value.valid),
    isCreating,
    onFormSubmit,
    makehandleClose
  };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "MoStorageAdd",
  __ssrInlineRender: true,
  props: { show: { type: Boolean, required: true } },
  emits: ["close", "success"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const {
      errors,
      name,
      nameAttrs,
      nodeId,
      nodeAttrs,
      devicePath,
      devicePathAttrs,
      hasNetworkAccess,
      hasNetworkAccessAttrs,
      nodes,
      nodesPending,
      nodesError,
      deviceOptions,
      devicesPending,
      devicesError,
      isValid,
      isCreating,
      onFormSubmit,
      makehandleClose
    } = useStorageAddForm();
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
        title: "ストレージプール追加",
        onClose: unref(handleClose)
      }, _attrs), {
        footer: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="modal-footer"${_scopeId}>`);
            _push2(ssrRenderComponent(UiSubmitButton, {
              disabled: unref(isCreating) || !unref(isValid),
              loading: unref(isCreating),
              label: "ストレージプールを追加",
              form: "storage-add-form",
              type: "submit"
            }, null, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "modal-footer" }, [
                createVNode(UiSubmitButton, {
                  disabled: unref(isCreating) || !unref(isValid),
                  loading: unref(isCreating),
                  label: "ストレージプールを追加",
                  form: "storage-add-form",
                  type: "submit"
                }, null, 8, ["disabled", "loading"])
              ])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<form id="storage-add-form" class="space-y-6"${_scopeId}><div class="space-y-4"${_scopeId}>`);
            _push2(ssrRenderComponent(FormInput, mergeProps({
              label: "プール名",
              name: "storage-name",
              type: "text",
              placeholder: "例: local-storage-pool",
              modelValue: unref(name),
              "onUpdate:modelValue": ($event) => isRef(name) ? name.value = $event : null
            }, unref(nameAttrs), {
              error: unref(errors).name,
              required: true
            }), null, _parent2, _scopeId));
            _push2(ssrRenderComponent(FormSelect, mergeProps({
              label: "物理ノード",
              name: "storage-node",
              options: unref(nodes) ?? [],
              "option-label": "name",
              "option-value": "id",
              placeholder: "ノードを選択してください",
              required: true,
              pending: unref(nodesPending),
              error: unref(nodesError),
              "error-message": unref(errors).nodeId,
              modelValue: unref(nodeId),
              "onUpdate:modelValue": ($event) => isRef(nodeId) ? nodeId.value = $event : null
            }, unref(nodeAttrs)), null, _parent2, _scopeId));
            _push2(ssrRenderComponent(FormSelect, mergeProps({
              label: "デバイスパス",
              name: "storage-device",
              options: unref(deviceOptions),
              placeholder: "デバイスを選択してください",
              required: true,
              pending: unref(devicesPending),
              error: unref(devicesError),
              "error-message": unref(errors).devicePath,
              disabled: !unref(nodeId),
              modelValue: unref(devicePath),
              "onUpdate:modelValue": ($event) => isRef(devicePath) ? devicePath.value = $event : null
            }, unref(devicePathAttrs)), null, _parent2, _scopeId));
            if (!unref(nodeId)) {
              _push2(`<p class="text-xs text-gray-500 mt-1"${_scopeId}> ※ 先に物理ノードを選択してください </p>`);
            } else if (unref(deviceOptions).length === 0 && !unref(devicesPending)) {
              _push2(`<p class="text-xs text-orange-500 mt-1"${_scopeId}> ※ 利用可能なデバイスが見つかりません </p>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(ssrRenderComponent(FormSelect, mergeProps({
              label: "ネットワークアクセス",
              name: "storage-network",
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
                id: "storage-add-form",
                onSubmit: withModifiers(unref(submitForm), ["prevent"]),
                class: "space-y-6"
              }, [
                createVNode("div", { class: "space-y-4" }, [
                  createVNode(FormInput, mergeProps({
                    label: "プール名",
                    name: "storage-name",
                    type: "text",
                    placeholder: "例: local-storage-pool",
                    modelValue: unref(name),
                    "onUpdate:modelValue": ($event) => isRef(name) ? name.value = $event : null
                  }, unref(nameAttrs), {
                    error: unref(errors).name,
                    required: true
                  }), null, 16, ["modelValue", "onUpdate:modelValue", "error"]),
                  createVNode(FormSelect, mergeProps({
                    label: "物理ノード",
                    name: "storage-node",
                    options: unref(nodes) ?? [],
                    "option-label": "name",
                    "option-value": "id",
                    placeholder: "ノードを選択してください",
                    required: true,
                    pending: unref(nodesPending),
                    error: unref(nodesError),
                    "error-message": unref(errors).nodeId,
                    modelValue: unref(nodeId),
                    "onUpdate:modelValue": ($event) => isRef(nodeId) ? nodeId.value = $event : null
                  }, unref(nodeAttrs)), null, 16, ["options", "pending", "error", "error-message", "modelValue", "onUpdate:modelValue"]),
                  createVNode(FormSelect, mergeProps({
                    label: "デバイスパス",
                    name: "storage-device",
                    options: unref(deviceOptions),
                    placeholder: "デバイスを選択してください",
                    required: true,
                    pending: unref(devicesPending),
                    error: unref(devicesError),
                    "error-message": unref(errors).devicePath,
                    disabled: !unref(nodeId),
                    modelValue: unref(devicePath),
                    "onUpdate:modelValue": ($event) => isRef(devicePath) ? devicePath.value = $event : null
                  }, unref(devicePathAttrs)), null, 16, ["options", "pending", "error", "error-message", "disabled", "modelValue", "onUpdate:modelValue"]),
                  !unref(nodeId) ? (openBlock(), createBlock("p", {
                    key: 0,
                    class: "text-xs text-gray-500 mt-1"
                  }, " ※ 先に物理ノードを選択してください ")) : unref(deviceOptions).length === 0 && !unref(devicesPending) ? (openBlock(), createBlock("p", {
                    key: 1,
                    class: "text-xs text-orange-500 mt-1"
                  }, " ※ 利用可能なデバイスが見つかりません ")) : createCommentVNode("", true),
                  createVNode(FormSelect, mergeProps({
                    label: "ネットワークアクセス",
                    name: "storage-network",
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/MoStorageAdd.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const MoStorageAdd = Object.assign(_sfc_main, { __name: "MoStorageAdd" });

export { MoStorageAdd as M };
//# sourceMappingURL=MoStorageAdd-B2clbFov.mjs.map
