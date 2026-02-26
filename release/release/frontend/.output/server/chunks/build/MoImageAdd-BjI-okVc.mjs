import { _ as _sfc_main$1 } from './BaseModal-XreF1fHA.mjs';
import { F as FormSelect } from './Select-Cb_WFau-.mjs';
import { U as UiSubmitButton } from './SubmitButton-BLZt3uil.mjs';
import { t as toSize, u as useToast, a as useRuntimeConfig } from './server.mjs';
import { defineComponent, mergeProps, unref, withCtx, isRef, createVNode, withModifiers, createBlock, createCommentVNode, openBlock, toDisplayString, computed, ref, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrRenderStyle } from 'vue/server-renderer';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { u as useResourceList } from './useResourceList-BY3jHLdB.mjs';
import { I as ImageCreateSchema } from './image-SWhs2cAJ.mjs';
import { u as useFormAction } from './useModalAction-CCl6IdMe.mjs';
import { e as extractErrorMessage } from './errorHandler-Bj20B0ou.mjs';
import { d as STORAGE } from './fetch-kOzZWayB.mjs';
import { F as FormInput } from './Input-jfnKbGQs.mjs';
import { D as DropZone } from './DropZone-DuFc6jYt.mjs';

const useLargeFileUpload = () => {
  const isUploading = ref(false);
  const progress = ref(0);
  const { addToast, updateToast, removeToast } = useToast();
  let toastId = null;
  let xhr = null;
  const uploadFile = (url, formData) => {
    const runtimeconfig = useRuntimeConfig();
    return new Promise((resolve, reject) => {
      if (isUploading.value) return;
      isUploading.value = true;
      progress.value = 0;
      toastId = addToast({
        message: "ファイルをアップロード中...",
        type: "info",
        progress: 0,
        duration: 0
      });
      xhr = new (void 0)();
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percent = Math.round(event.loaded / event.total * 100);
          progress.value = percent;
          if (toastId) {
            updateToast(toastId, {
              progress: percent,
              message: `アップロード中... (${percent}%)`
            });
          }
        }
      });
      xhr.addEventListener("load", () => {
        isUploading.value = false;
        if (xhr && xhr.status >= 200 && xhr.status < 300) {
          if (toastId) {
            updateToast(toastId, {
              type: "success",
              message: "アップロードが完了しました！",
              progress: void 0
              // プログレスバーを消す
            });
            setTimeout(() => {
              if (toastId) removeToast(toastId);
              toastId = null;
            }, 3e3);
          }
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (e) {
            resolve(xhr?.responseText);
          }
        } else {
          handleError(new Error(xhr?.statusText || "Upload failed"));
        }
      });
      const handleError = (error) => {
        isUploading.value = false;
        if (toastId) {
          updateToast(toastId, {
            type: "error",
            message: "アップロードに失敗しました。",
            details: error.message,
            progress: void 0
          });
          setTimeout(() => {
            if (toastId) removeToast(toastId);
            toastId = null;
          }, 5e3);
        }
        reject(error);
      };
      xhr.addEventListener(
        "error",
        () => handleError(new Error("Network error"))
      );
      xhr.addEventListener("abort", () => handleError(new Error("Aborted")));
      const baseUrl = runtimeconfig.public.apiBaseUrl || "";
      const fullUrl = baseUrl + `${url}`;
      xhr.open("POST", fullUrl);
      xhr.setRequestHeader("Authorization", "Bearer mock-token");
      xhr.send(formData);
    });
  };
  const cancelUpload = () => {
    if (xhr) {
      xhr.abort();
      xhr = null;
      isUploading.value = false;
      if (toastId) {
        updateToast(toastId, {
          type: "info",
          message: "アップロードを中止しました。",
          progress: void 0
        });
        setTimeout(() => {
          if (toastId) removeToast(toastId);
          toastId = null;
        }, 3e3);
      }
    }
  };
  return {
    uploadFile,
    cancelUpload,
    isUploading,
    progress
  };
};
function useImageAddForm() {
  const { handleFormSubmit, makeHandleClose: createHandleClose } = useFormAction();
  const { uploadFile, cancelUpload, isUploading, progress } = useLargeFileUpload();
  const {
    data: storagePools,
    pending: storagePoolsPending,
    error: storagePoolsError
  } = useResourceList(STORAGE.name);
  const { errors, handleSubmit, resetForm, defineField, meta } = useForm({
    validationSchema: toTypedSchema(ImageCreateSchema),
    initialValues: {
      name: "",
      description: "",
      file: void 0,
      storagePoolId: ""
    }
  });
  const [name, nameAttrs] = defineField("name");
  const [description, descriptionAttrs] = defineField("description");
  const [file] = defineField("file");
  const [storagePoolId, storagePoolIdAttrs] = defineField("storagePoolId");
  const selectedStoragePool = computed(() => {
    if (!storagePools.value || !storagePoolId.value) return null;
    return storagePools.value.find((pool) => pool.id === storagePoolId.value) || null;
  });
  const onFormSubmit = (emit) => handleFormSubmit(
    handleSubmit,
    {
      // API実行ロジック
      execute: async (payload) => {
        if (!payload.file) {
          return {
            success: false,
            error: new Error("ファイルが選択されていません。")
          };
        }
        try {
          const formData = new FormData();
          formData.append("file", payload.file);
          const metadata = {
            name: payload.name,
            description: payload.description || "",
            storagePoolId: payload.storagePoolId
          };
          formData.append("metadata", JSON.stringify(metadata));
          await uploadFile("images", formData);
          return { success: true };
        } catch (error) {
          const message = extractErrorMessage(
            error,
            "ファイルのアップロードに失敗しました。"
          );
          return { success: false, error: new Error(message) };
        }
      },
      // 成功メッセージ
      onSuccessMessage: (values) => `イメージ「${values.name}」のアップロードが完了しました。`,
      // 成功時処理
      onSuccess: () => resetForm(),
      // 送信直後にモーダルを閉じる
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
    file,
    storagePoolId,
    storagePoolIdAttrs,
    storagePools,
    storagePoolsPending,
    storagePoolsError,
    selectedStoragePool,
    isCreating: isUploading,
    isValid: computed(() => meta.value.valid),
    onFormSubmit,
    makeHandleClose,
    resetForm,
    progress,
    isUploading,
    cancelUpload
  };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "MoImageAdd",
  __ssrInlineRender: true,
  props: { show: { type: Boolean, required: true } },
  emits: ["close", "success"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const {
      errors,
      name,
      nameAttrs,
      description,
      descriptionAttrs,
      file,
      // ★ ストレージプール関連
      storagePoolId,
      storagePoolIdAttrs,
      storagePools,
      storagePoolsPending,
      storagePoolsError,
      selectedStoragePool,
      isValid,
      isCreating,
      onFormSubmit,
      makeHandleClose
    } = useImageAddForm();
    const onSubmit = onFormSubmit(emit);
    const handleClose = makeHandleClose(emit);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_BaseModal = _sfc_main$1;
      const _component_FormSelect = FormSelect;
      const _component_UiSubmitButton = UiSubmitButton;
      _push(ssrRenderComponent(_component_BaseModal, mergeProps({
        show: __props.show,
        title: "イメージ追加",
        onClose: unref(handleClose)
      }, _attrs), {
        footer: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="modal-footer"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UiSubmitButton, {
              disabled: unref(isCreating) || !unref(isValid),
              loading: unref(isCreating),
              label: "イメージを追加",
              form: "image-add-form",
              type: "submit"
            }, null, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "modal-footer" }, [
                createVNode(_component_UiSubmitButton, {
                  disabled: unref(isCreating) || !unref(isValid),
                  loading: unref(isCreating),
                  label: "イメージを追加",
                  form: "image-add-form",
                  type: "submit"
                }, null, 8, ["disabled", "loading"])
              ])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<form id="image-add-form" class="modal-space"${_scopeId}>`);
            _push2(ssrRenderComponent(FormInput, mergeProps({
              label: "イメージ名",
              name: "image-name-add",
              type: "text",
              placeholder: "例: ubuntu-24.04-amd64",
              modelValue: unref(name),
              "onUpdate:modelValue": ($event) => isRef(name) ? name.value = $event : null
            }, unref(nameAttrs), {
              error: unref(errors).name,
              required: true
            }), null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_FormSelect, mergeProps({
              label: "作成先ストレージプール",
              name: "image-storage-add",
              options: unref(storagePools) ?? [],
              "option-label": "name",
              "option-value": "id",
              placeholder: "ストレージプールを選択してください",
              required: true,
              pending: unref(storagePoolsPending),
              error: unref(storagePoolsError),
              "error-message": unref(errors).storagePoolId,
              modelValue: unref(storagePoolId),
              "onUpdate:modelValue": ($event) => isRef(storagePoolId) ? storagePoolId.value = $event : null
            }, unref(storagePoolIdAttrs)), null, _parent2, _scopeId));
            if (unref(selectedStoragePool)) {
              _push2(`<div class="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm"${_scopeId}><div class="mb-2 flex items-center justify-between"${_scopeId}><span class="font-medium text-gray-600"${_scopeId}>利用可能容量</span><span class="font-bold text-blue-600"${_scopeId}>${ssrInterpolate(("toSize" in _ctx ? _ctx.toSize : unref(toSize))(unref(selectedStoragePool).availableSize))}</span></div><div class="relative h-2.5 w-full overflow-hidden rounded-full bg-gray-200"${_scopeId}><div class="h-full rounded-full bg-blue-500 transition-all duration-300" style="${ssrRenderStyle({
                width: `${unref(selectedStoragePool).usedSize / unref(selectedStoragePool).totalSize * 100}%`
              })}"${_scopeId}></div></div><div class="mt-1 flex justify-between text-xs text-gray-500"${_scopeId}><span${_scopeId}>使用中: ${ssrInterpolate(("toSize" in _ctx ? _ctx.toSize : unref(toSize))(unref(selectedStoragePool).usedSize))}</span><span${_scopeId}>合計: ${ssrInterpolate(("toSize" in _ctx ? _ctx.toSize : unref(toSize))(unref(selectedStoragePool).totalSize))}</span></div></div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(ssrRenderComponent(DropZone, {
              id: "image-file-add",
              modelValue: unref(file),
              "onUpdate:modelValue": ($event) => isRef(file) ? file.value = $event : null,
              accept: ".img,.qcow2,.zip,.gz,.xz,.iso",
              required: true,
              label: "ファイルアップロード",
              "error-message": unref(errors).file
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(FormInput, mergeProps({
              label: "説明",
              name: "image-description-add",
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
                id: "image-add-form",
                onSubmit: withModifiers(unref(onSubmit), ["prevent"]),
                class: "modal-space"
              }, [
                createVNode(FormInput, mergeProps({
                  label: "イメージ名",
                  name: "image-name-add",
                  type: "text",
                  placeholder: "例: ubuntu-24.04-amd64",
                  modelValue: unref(name),
                  "onUpdate:modelValue": ($event) => isRef(name) ? name.value = $event : null
                }, unref(nameAttrs), {
                  error: unref(errors).name,
                  required: true
                }), null, 16, ["modelValue", "onUpdate:modelValue", "error"]),
                createVNode(_component_FormSelect, mergeProps({
                  label: "作成先ストレージプール",
                  name: "image-storage-add",
                  options: unref(storagePools) ?? [],
                  "option-label": "name",
                  "option-value": "id",
                  placeholder: "ストレージプールを選択してください",
                  required: true,
                  pending: unref(storagePoolsPending),
                  error: unref(storagePoolsError),
                  "error-message": unref(errors).storagePoolId,
                  modelValue: unref(storagePoolId),
                  "onUpdate:modelValue": ($event) => isRef(storagePoolId) ? storagePoolId.value = $event : null
                }, unref(storagePoolIdAttrs)), null, 16, ["options", "pending", "error", "error-message", "modelValue", "onUpdate:modelValue"]),
                unref(selectedStoragePool) ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm"
                }, [
                  createVNode("div", { class: "mb-2 flex items-center justify-between" }, [
                    createVNode("span", { class: "font-medium text-gray-600" }, "利用可能容量"),
                    createVNode("span", { class: "font-bold text-blue-600" }, toDisplayString(("toSize" in _ctx ? _ctx.toSize : unref(toSize))(unref(selectedStoragePool).availableSize)), 1)
                  ]),
                  createVNode("div", { class: "relative h-2.5 w-full overflow-hidden rounded-full bg-gray-200" }, [
                    createVNode("div", {
                      class: "h-full rounded-full bg-blue-500 transition-all duration-300",
                      style: {
                        width: `${unref(selectedStoragePool).usedSize / unref(selectedStoragePool).totalSize * 100}%`
                      }
                    }, null, 4)
                  ]),
                  createVNode("div", { class: "mt-1 flex justify-between text-xs text-gray-500" }, [
                    createVNode("span", null, "使用中: " + toDisplayString(("toSize" in _ctx ? _ctx.toSize : unref(toSize))(unref(selectedStoragePool).usedSize)), 1),
                    createVNode("span", null, "合計: " + toDisplayString(("toSize" in _ctx ? _ctx.toSize : unref(toSize))(unref(selectedStoragePool).totalSize)), 1)
                  ])
                ])) : createCommentVNode("", true),
                createVNode(DropZone, {
                  id: "image-file-add",
                  modelValue: unref(file),
                  "onUpdate:modelValue": ($event) => isRef(file) ? file.value = $event : null,
                  accept: ".img,.qcow2,.zip,.gz,.xz,.iso",
                  required: true,
                  label: "ファイルアップロード",
                  "error-message": unref(errors).file
                }, null, 8, ["modelValue", "onUpdate:modelValue", "error-message"]),
                createVNode(FormInput, mergeProps({
                  label: "説明",
                  name: "image-description-add",
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/MoImageAdd.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const MoImageAdd = Object.assign(_sfc_main, { __name: "MoImageAdd" });

export { MoImageAdd as M };
//# sourceMappingURL=MoImageAdd-BjI-okVc.mjs.map
