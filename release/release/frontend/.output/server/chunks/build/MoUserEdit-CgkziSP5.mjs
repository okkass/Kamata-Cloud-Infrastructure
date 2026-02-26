import { _ as _sfc_main$1 } from './BaseModal-XreF1fHA.mjs';
import { U as UiSubmitButton } from './SubmitButton-BLZt3uil.mjs';
import { defineComponent, mergeProps, withCtx, unref, isRef, createVNode, withDirectives, createTextVNode, vModelCheckbox, withModifiers, watch, computed, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderAttrs, ssrLooseContain, ssrGetDynamicModelProps } from 'vue/server-renderer';
import { useForm } from 'vee-validate';
import { b as UserUpdateSchema } from './user-BB0TVvYL.mjs';
import { toTypedSchema } from '@vee-validate/zod';
import { u as useResourceUpdate } from './useResourceEdit-BDkGI_Ar.mjs';
import { _ as _export_sfc, c as convertByteToUnit, q as convertUnitToByte } from './server.mjs';
import { u as useFormAction } from './useModalAction-CCl6IdMe.mjs';
import { U as USER } from './fetch-kOzZWayB.mjs';
import { F as FormInput } from './Input-jfnKbGQs.mjs';
import { _ as __nuxt_component_1 } from './Section-B8lyqO8a.mjs';

function useUserEditForm(props) {
  const { handleFormSubmit, makeHandleClose: createHandleClose } = useFormAction();
  const { executeUpdate, isUpdating } = useResourceUpdate(USER.name);
  const { errors, defineField, handleSubmit, resetForm, meta } = useForm({
    validationSchema: toTypedSchema(UserUpdateSchema),
    initialValues: {
      name: "",
      email: "",
      maxCpuCore: void 0,
      maxMemorySize: void 0,
      maxStorageSize: void 0,
      isAdmin: false,
      isImageAdmin: false,
      isInstanceTypeAdmin: false,
      isNetworkAdmin: false,
      isNodeAdmin: false,
      isSecurityGroupAdmin: false,
      isVirtualMachineAdmin: false
    }
  });
  const [name, nameAttrs] = defineField("name");
  const [email, emailAttrs] = defineField("email");
  const [maxCpuCore, maxCpuCoreAttrs] = defineField("maxCpuCore");
  const [maxMemorySize, maxMemorySizeAttrs] = defineField("maxMemorySize");
  const [maxStorageSize, maxStorageSizeAttrs] = defineField("maxStorageSize");
  const [isAdmin, isAdminAttrs] = defineField("isAdmin");
  const [isImageAdmin, isImageAdminAttrs] = defineField("isImageAdmin");
  const [isInstanceTypeAdmin, isInstanceTypeAdminAttrs] = defineField(
    "isInstanceTypeAdmin"
  );
  const [isNetworkAdmin, isNetworkAdminAttrs] = defineField("isNetworkAdmin");
  const [isNodeAdmin, isNodeAdminAttrs] = defineField("isNodeAdmin");
  const [isSecurityGroupAdmin, isSecurityGroupAdminAttrs] = defineField(
    "isSecurityGroupAdmin"
  );
  const [isVirtualMachineAdmin, isVirtualMachineAdminAttrs] = defineField(
    "isVirtualMachineAdmin"
  );
  watch(
    [() => props.data, () => props.show],
    ([userData, show]) => {
      if (show && userData) {
        resetForm({
          values: {
            name: userData.name,
            email: userData.email,
            // クォータ: UserServerBase のプロパティを使用
            maxCpuCore: userData.maxCpuCore ?? void 0,
            maxMemorySize: userData.maxMemorySize ? convertByteToUnit(userData.maxMemorySize, "MB") : void 0,
            maxStorageSize: userData.maxStorageSize ? convertByteToUnit(userData.maxStorageSize, "GB") : void 0,
            // 権限
            isAdmin: userData.isAdmin,
            isImageAdmin: userData.isImageAdmin,
            isInstanceTypeAdmin: userData.isInstanceTypeAdmin,
            isNetworkAdmin: userData.isNetworkAdmin,
            isNodeAdmin: userData.isNodeAdmin,
            isSecurityGroupAdmin: userData.isSecurityGroupAdmin,
            isVirtualMachineAdmin: userData.isVirtualMachineAdmin
          }
        });
      }
    },
    { immediate: true, deep: true }
  );
  const onFormSubmit = (emit) => handleFormSubmit(
    handleSubmit,
    {
      execute: async (formValues) => {
        const payload = {
          name: formValues.name,
          email: formValues.email,
          maxCpuCore: formValues.maxCpuCore || null,
          maxMemorySize: formValues.maxMemorySize ? convertUnitToByte(formValues.maxMemorySize, "MB") : null,
          maxStorageSize: formValues.maxStorageSize ? convertUnitToByte(formValues.maxStorageSize, "GB") : null,
          isAdmin: formValues.isAdmin,
          isImageAdmin: formValues.isImageAdmin,
          isInstanceTypeAdmin: formValues.isInstanceTypeAdmin,
          isNetworkAdmin: formValues.isNetworkAdmin,
          isNodeAdmin: formValues.isNodeAdmin,
          isSecurityGroupAdmin: formValues.isSecurityGroupAdmin,
          isVirtualMachineAdmin: formValues.isVirtualMachineAdmin
        };
        return await executeUpdate(props.data ? props.data.id : "", payload);
      },
      onSuccessMessage: (payload) => `利用者「${payload.name}」の情報を更新しました。`,
      onSuccess: () => resetForm(),
      emitCloseImmediately: true
    },
    emit
  );
  const makeHandleClose = (emit) => createHandleClose(resetForm, emit);
  return {
    errors,
    name,
    nameAttrs,
    email,
    emailAttrs,
    maxCpuCore,
    maxCpuCoreAttrs,
    maxMemorySize,
    maxMemorySizeAttrs,
    maxStorageSize,
    maxStorageSizeAttrs,
    isAdmin,
    isAdminAttrs,
    isImageAdmin,
    isImageAdminAttrs,
    isInstanceTypeAdmin,
    isInstanceTypeAdminAttrs,
    isNetworkAdmin,
    isNetworkAdminAttrs,
    isNodeAdmin,
    isNodeAdminAttrs,
    isSecurityGroupAdmin,
    isSecurityGroupAdminAttrs,
    isVirtualMachineAdmin,
    isVirtualMachineAdminAttrs,
    // 状態
    isValid: computed(() => meta.value.valid),
    isUpdating,
    onFormSubmit,
    makeHandleClose
  };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "MoUserEdit",
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
      isValid,
      name,
      nameAttrs,
      email,
      emailAttrs,
      maxCpuCore,
      maxCpuCoreAttrs,
      maxMemorySize,
      maxMemorySizeAttrs,
      maxStorageSize,
      maxStorageSizeAttrs,
      isAdmin,
      isAdminAttrs,
      isImageAdmin,
      isImageAdminAttrs,
      isInstanceTypeAdmin,
      isInstanceTypeAdminAttrs,
      isNetworkAdmin,
      isNetworkAdminAttrs,
      isNodeAdmin,
      isNodeAdminAttrs,
      isSecurityGroupAdmin,
      isSecurityGroupAdminAttrs,
      isVirtualMachineAdmin,
      isVirtualMachineAdminAttrs,
      isUpdating,
      onFormSubmit
    } = useUserEditForm(props);
    const submitForm = onFormSubmit(emit);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_BaseModal = _sfc_main$1;
      const _component_UiSubmitButton = UiSubmitButton;
      let _temp0, _temp1, _temp2, _temp3, _temp4, _temp5, _temp6;
      _push(ssrRenderComponent(_component_BaseModal, mergeProps({
        show: __props.show,
        title: "利用者の編集",
        onClose: ($event) => _ctx.$emit("close")
      }, _attrs), {
        footer: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="modal-footer" data-v-23fdd41a${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UiSubmitButton, {
              form: "user-edit-form",
              type: "submit",
              label: "更新",
              loading: unref(isUpdating),
              disabled: !unref(isValid)
            }, null, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "modal-footer" }, [
                createVNode(_component_UiSubmitButton, {
                  form: "user-edit-form",
                  type: "submit",
                  label: "更新",
                  loading: unref(isUpdating),
                  disabled: !unref(isValid)
                }, null, 8, ["loading", "disabled"])
              ])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<form id="user-edit-form" data-v-23fdd41a${_scopeId}>`);
            _push2(ssrRenderComponent(__nuxt_component_1, { title: "基本情報" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(FormInput, mergeProps({
                    label: "アカウント名",
                    name: "user-account-name-edit",
                    type: "text",
                    modelValue: unref(name),
                    "onUpdate:modelValue": ($event) => isRef(name) ? name.value = $event : null
                  }, unref(nameAttrs), {
                    error: unref(errors).name,
                    required: true
                  }), null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(FormInput, mergeProps({
                    label: "メールアドレス",
                    name: "user-email-edit",
                    type: "email",
                    modelValue: unref(email),
                    "onUpdate:modelValue": ($event) => isRef(email) ? email.value = $event : null
                  }, unref(emailAttrs), {
                    error: unref(errors).email,
                    required: true
                  }), null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(FormInput, mergeProps({
                      label: "アカウント名",
                      name: "user-account-name-edit",
                      type: "text",
                      modelValue: unref(name),
                      "onUpdate:modelValue": ($event) => isRef(name) ? name.value = $event : null
                    }, unref(nameAttrs), {
                      error: unref(errors).name,
                      required: true
                    }), null, 16, ["modelValue", "onUpdate:modelValue", "error"]),
                    createVNode(FormInput, mergeProps({
                      label: "メールアドレス",
                      name: "user-email-edit",
                      type: "email",
                      modelValue: unref(email),
                      "onUpdate:modelValue": ($event) => isRef(email) ? email.value = $event : null
                    }, unref(emailAttrs), {
                      error: unref(errors).email,
                      required: true
                    }), null, 16, ["modelValue", "onUpdate:modelValue", "error"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(__nuxt_component_1, { title: "リソースクォータ (上限なしの場合は空欄)" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(FormInput, mergeProps({
                    label: "最大vCPU (コア)",
                    name: "user-max-cpu-edit",
                    type: "number",
                    modelValue: unref(maxCpuCore),
                    "onUpdate:modelValue": ($event) => isRef(maxCpuCore) ? maxCpuCore.value = $event : null,
                    modelModifiers: { number: true }
                  }, unref(maxCpuCoreAttrs), {
                    error: unref(errors).maxCpuCore,
                    min: "1"
                  }), null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(FormInput, mergeProps({
                    label: "最大メモリ (MB)",
                    name: "user-max-memory-edit",
                    type: "number",
                    modelValue: unref(maxMemorySize),
                    "onUpdate:modelValue": ($event) => isRef(maxMemorySize) ? maxMemorySize.value = $event : null,
                    modelModifiers: { number: true }
                  }, unref(maxMemorySizeAttrs), {
                    error: unref(errors).maxMemorySize,
                    min: "1"
                  }), null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(FormInput, mergeProps({
                    label: "最大ストレージ (GB)",
                    name: "user-max-storage-edit",
                    type: "number",
                    modelValue: unref(maxStorageSize),
                    "onUpdate:modelValue": ($event) => isRef(maxStorageSize) ? maxStorageSize.value = $event : null,
                    modelModifiers: { number: true }
                  }, unref(maxStorageSizeAttrs), {
                    error: unref(errors).maxStorageSize,
                    min: "1"
                  }), null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(FormInput, mergeProps({
                      label: "最大vCPU (コア)",
                      name: "user-max-cpu-edit",
                      type: "number",
                      modelValue: unref(maxCpuCore),
                      "onUpdate:modelValue": ($event) => isRef(maxCpuCore) ? maxCpuCore.value = $event : null,
                      modelModifiers: { number: true }
                    }, unref(maxCpuCoreAttrs), {
                      error: unref(errors).maxCpuCore,
                      min: "1"
                    }), null, 16, ["modelValue", "onUpdate:modelValue", "error"]),
                    createVNode(FormInput, mergeProps({
                      label: "最大メモリ (MB)",
                      name: "user-max-memory-edit",
                      type: "number",
                      modelValue: unref(maxMemorySize),
                      "onUpdate:modelValue": ($event) => isRef(maxMemorySize) ? maxMemorySize.value = $event : null,
                      modelModifiers: { number: true }
                    }, unref(maxMemorySizeAttrs), {
                      error: unref(errors).maxMemorySize,
                      min: "1"
                    }), null, 16, ["modelValue", "onUpdate:modelValue", "error"]),
                    createVNode(FormInput, mergeProps({
                      label: "最大ストレージ (GB)",
                      name: "user-max-storage-edit",
                      type: "number",
                      modelValue: unref(maxStorageSize),
                      "onUpdate:modelValue": ($event) => isRef(maxStorageSize) ? maxStorageSize.value = $event : null,
                      modelModifiers: { number: true }
                    }, unref(maxStorageSizeAttrs), {
                      error: unref(errors).maxStorageSize,
                      min: "1"
                    }), null, 16, ["modelValue", "onUpdate:modelValue", "error"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(__nuxt_component_1, { title: "管理者権限" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="checkbox-grid" data-v-23fdd41a${_scopeId2}><label class="checkbox-label" data-v-23fdd41a${_scopeId2}><input${ssrRenderAttrs((_temp0 = mergeProps({
                    type: "checkbox",
                    checked: Array.isArray(unref(isAdmin)) ? ssrLooseContain(unref(isAdmin), null) : unref(isAdmin)
                  }, unref(isAdminAttrs)), mergeProps(_temp0, ssrGetDynamicModelProps(_temp0, unref(isAdmin)))))} data-v-23fdd41a${_scopeId2}> 全体管理者 </label><label class="checkbox-label" data-v-23fdd41a${_scopeId2}><input${ssrRenderAttrs((_temp1 = mergeProps({
                    type: "checkbox",
                    checked: Array.isArray(unref(isImageAdmin)) ? ssrLooseContain(unref(isImageAdmin), null) : unref(isImageAdmin)
                  }, unref(isImageAdminAttrs)), mergeProps(_temp1, ssrGetDynamicModelProps(_temp1, unref(isImageAdmin)))))} data-v-23fdd41a${_scopeId2}> イメージ管理 </label><label class="checkbox-label" data-v-23fdd41a${_scopeId2}><input${ssrRenderAttrs((_temp2 = mergeProps({
                    type: "checkbox",
                    checked: Array.isArray(unref(isInstanceTypeAdmin)) ? ssrLooseContain(unref(isInstanceTypeAdmin), null) : unref(isInstanceTypeAdmin)
                  }, unref(isInstanceTypeAdminAttrs)), mergeProps(_temp2, ssrGetDynamicModelProps(_temp2, unref(isInstanceTypeAdmin)))))} data-v-23fdd41a${_scopeId2}> インスタンスタイプ管理 </label><label class="checkbox-label" data-v-23fdd41a${_scopeId2}><input${ssrRenderAttrs((_temp3 = mergeProps({
                    type: "checkbox",
                    checked: Array.isArray(unref(isNetworkAdmin)) ? ssrLooseContain(unref(isNetworkAdmin), null) : unref(isNetworkAdmin)
                  }, unref(isNetworkAdminAttrs)), mergeProps(_temp3, ssrGetDynamicModelProps(_temp3, unref(isNetworkAdmin)))))} data-v-23fdd41a${_scopeId2}> ネットワーク管理 </label><label class="checkbox-label" data-v-23fdd41a${_scopeId2}><input${ssrRenderAttrs((_temp4 = mergeProps({
                    type: "checkbox",
                    checked: Array.isArray(unref(isNodeAdmin)) ? ssrLooseContain(unref(isNodeAdmin), null) : unref(isNodeAdmin)
                  }, unref(isNodeAdminAttrs)), mergeProps(_temp4, ssrGetDynamicModelProps(_temp4, unref(isNodeAdmin)))))} data-v-23fdd41a${_scopeId2}> ノード管理 </label><label class="checkbox-label" data-v-23fdd41a${_scopeId2}><input${ssrRenderAttrs((_temp5 = mergeProps({
                    type: "checkbox",
                    checked: Array.isArray(unref(isSecurityGroupAdmin)) ? ssrLooseContain(unref(isSecurityGroupAdmin), null) : unref(isSecurityGroupAdmin)
                  }, unref(isSecurityGroupAdminAttrs)), mergeProps(_temp5, ssrGetDynamicModelProps(_temp5, unref(isSecurityGroupAdmin)))))} data-v-23fdd41a${_scopeId2}> セキュリティグループ管理 </label><label class="checkbox-label" data-v-23fdd41a${_scopeId2}><input${ssrRenderAttrs((_temp6 = mergeProps({
                    type: "checkbox",
                    checked: Array.isArray(unref(isVirtualMachineAdmin)) ? ssrLooseContain(unref(isVirtualMachineAdmin), null) : unref(isVirtualMachineAdmin)
                  }, unref(isVirtualMachineAdminAttrs)), mergeProps(_temp6, ssrGetDynamicModelProps(_temp6, unref(isVirtualMachineAdmin)))))} data-v-23fdd41a${_scopeId2}> 仮想マシン管理 </label></div>`);
                } else {
                  return [
                    createVNode("div", { class: "checkbox-grid" }, [
                      createVNode("label", { class: "checkbox-label" }, [
                        withDirectives(createVNode("input", mergeProps({
                          type: "checkbox",
                          "onUpdate:modelValue": ($event) => isRef(isAdmin) ? isAdmin.value = $event : null
                        }, unref(isAdminAttrs)), null, 16, ["onUpdate:modelValue"]), [
                          [vModelCheckbox, unref(isAdmin)]
                        ]),
                        createTextVNode(" 全体管理者 ")
                      ]),
                      createVNode("label", { class: "checkbox-label" }, [
                        withDirectives(createVNode("input", mergeProps({
                          type: "checkbox",
                          "onUpdate:modelValue": ($event) => isRef(isImageAdmin) ? isImageAdmin.value = $event : null
                        }, unref(isImageAdminAttrs)), null, 16, ["onUpdate:modelValue"]), [
                          [vModelCheckbox, unref(isImageAdmin)]
                        ]),
                        createTextVNode(" イメージ管理 ")
                      ]),
                      createVNode("label", { class: "checkbox-label" }, [
                        withDirectives(createVNode("input", mergeProps({
                          type: "checkbox",
                          "onUpdate:modelValue": ($event) => isRef(isInstanceTypeAdmin) ? isInstanceTypeAdmin.value = $event : null
                        }, unref(isInstanceTypeAdminAttrs)), null, 16, ["onUpdate:modelValue"]), [
                          [vModelCheckbox, unref(isInstanceTypeAdmin)]
                        ]),
                        createTextVNode(" インスタンスタイプ管理 ")
                      ]),
                      createVNode("label", { class: "checkbox-label" }, [
                        withDirectives(createVNode("input", mergeProps({
                          type: "checkbox",
                          "onUpdate:modelValue": ($event) => isRef(isNetworkAdmin) ? isNetworkAdmin.value = $event : null
                        }, unref(isNetworkAdminAttrs)), null, 16, ["onUpdate:modelValue"]), [
                          [vModelCheckbox, unref(isNetworkAdmin)]
                        ]),
                        createTextVNode(" ネットワーク管理 ")
                      ]),
                      createVNode("label", { class: "checkbox-label" }, [
                        withDirectives(createVNode("input", mergeProps({
                          type: "checkbox",
                          "onUpdate:modelValue": ($event) => isRef(isNodeAdmin) ? isNodeAdmin.value = $event : null
                        }, unref(isNodeAdminAttrs)), null, 16, ["onUpdate:modelValue"]), [
                          [vModelCheckbox, unref(isNodeAdmin)]
                        ]),
                        createTextVNode(" ノード管理 ")
                      ]),
                      createVNode("label", { class: "checkbox-label" }, [
                        withDirectives(createVNode("input", mergeProps({
                          type: "checkbox",
                          "onUpdate:modelValue": ($event) => isRef(isSecurityGroupAdmin) ? isSecurityGroupAdmin.value = $event : null
                        }, unref(isSecurityGroupAdminAttrs)), null, 16, ["onUpdate:modelValue"]), [
                          [vModelCheckbox, unref(isSecurityGroupAdmin)]
                        ]),
                        createTextVNode(" セキュリティグループ管理 ")
                      ]),
                      createVNode("label", { class: "checkbox-label" }, [
                        withDirectives(createVNode("input", mergeProps({
                          type: "checkbox",
                          "onUpdate:modelValue": ($event) => isRef(isVirtualMachineAdmin) ? isVirtualMachineAdmin.value = $event : null
                        }, unref(isVirtualMachineAdminAttrs)), null, 16, ["onUpdate:modelValue"]), [
                          [vModelCheckbox, unref(isVirtualMachineAdmin)]
                        ]),
                        createTextVNode(" 仮想マシン管理 ")
                      ])
                    ])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</form>`);
          } else {
            return [
              createVNode("form", {
                id: "user-edit-form",
                onSubmit: withModifiers(unref(submitForm), ["prevent"])
              }, [
                createVNode(__nuxt_component_1, { title: "基本情報" }, {
                  default: withCtx(() => [
                    createVNode(FormInput, mergeProps({
                      label: "アカウント名",
                      name: "user-account-name-edit",
                      type: "text",
                      modelValue: unref(name),
                      "onUpdate:modelValue": ($event) => isRef(name) ? name.value = $event : null
                    }, unref(nameAttrs), {
                      error: unref(errors).name,
                      required: true
                    }), null, 16, ["modelValue", "onUpdate:modelValue", "error"]),
                    createVNode(FormInput, mergeProps({
                      label: "メールアドレス",
                      name: "user-email-edit",
                      type: "email",
                      modelValue: unref(email),
                      "onUpdate:modelValue": ($event) => isRef(email) ? email.value = $event : null
                    }, unref(emailAttrs), {
                      error: unref(errors).email,
                      required: true
                    }), null, 16, ["modelValue", "onUpdate:modelValue", "error"])
                  ]),
                  _: 1
                }),
                createVNode(__nuxt_component_1, { title: "リソースクォータ (上限なしの場合は空欄)" }, {
                  default: withCtx(() => [
                    createVNode(FormInput, mergeProps({
                      label: "最大vCPU (コア)",
                      name: "user-max-cpu-edit",
                      type: "number",
                      modelValue: unref(maxCpuCore),
                      "onUpdate:modelValue": ($event) => isRef(maxCpuCore) ? maxCpuCore.value = $event : null,
                      modelModifiers: { number: true }
                    }, unref(maxCpuCoreAttrs), {
                      error: unref(errors).maxCpuCore,
                      min: "1"
                    }), null, 16, ["modelValue", "onUpdate:modelValue", "error"]),
                    createVNode(FormInput, mergeProps({
                      label: "最大メモリ (MB)",
                      name: "user-max-memory-edit",
                      type: "number",
                      modelValue: unref(maxMemorySize),
                      "onUpdate:modelValue": ($event) => isRef(maxMemorySize) ? maxMemorySize.value = $event : null,
                      modelModifiers: { number: true }
                    }, unref(maxMemorySizeAttrs), {
                      error: unref(errors).maxMemorySize,
                      min: "1"
                    }), null, 16, ["modelValue", "onUpdate:modelValue", "error"]),
                    createVNode(FormInput, mergeProps({
                      label: "最大ストレージ (GB)",
                      name: "user-max-storage-edit",
                      type: "number",
                      modelValue: unref(maxStorageSize),
                      "onUpdate:modelValue": ($event) => isRef(maxStorageSize) ? maxStorageSize.value = $event : null,
                      modelModifiers: { number: true }
                    }, unref(maxStorageSizeAttrs), {
                      error: unref(errors).maxStorageSize,
                      min: "1"
                    }), null, 16, ["modelValue", "onUpdate:modelValue", "error"])
                  ]),
                  _: 1
                }),
                createVNode(__nuxt_component_1, { title: "管理者権限" }, {
                  default: withCtx(() => [
                    createVNode("div", { class: "checkbox-grid" }, [
                      createVNode("label", { class: "checkbox-label" }, [
                        withDirectives(createVNode("input", mergeProps({
                          type: "checkbox",
                          "onUpdate:modelValue": ($event) => isRef(isAdmin) ? isAdmin.value = $event : null
                        }, unref(isAdminAttrs)), null, 16, ["onUpdate:modelValue"]), [
                          [vModelCheckbox, unref(isAdmin)]
                        ]),
                        createTextVNode(" 全体管理者 ")
                      ]),
                      createVNode("label", { class: "checkbox-label" }, [
                        withDirectives(createVNode("input", mergeProps({
                          type: "checkbox",
                          "onUpdate:modelValue": ($event) => isRef(isImageAdmin) ? isImageAdmin.value = $event : null
                        }, unref(isImageAdminAttrs)), null, 16, ["onUpdate:modelValue"]), [
                          [vModelCheckbox, unref(isImageAdmin)]
                        ]),
                        createTextVNode(" イメージ管理 ")
                      ]),
                      createVNode("label", { class: "checkbox-label" }, [
                        withDirectives(createVNode("input", mergeProps({
                          type: "checkbox",
                          "onUpdate:modelValue": ($event) => isRef(isInstanceTypeAdmin) ? isInstanceTypeAdmin.value = $event : null
                        }, unref(isInstanceTypeAdminAttrs)), null, 16, ["onUpdate:modelValue"]), [
                          [vModelCheckbox, unref(isInstanceTypeAdmin)]
                        ]),
                        createTextVNode(" インスタンスタイプ管理 ")
                      ]),
                      createVNode("label", { class: "checkbox-label" }, [
                        withDirectives(createVNode("input", mergeProps({
                          type: "checkbox",
                          "onUpdate:modelValue": ($event) => isRef(isNetworkAdmin) ? isNetworkAdmin.value = $event : null
                        }, unref(isNetworkAdminAttrs)), null, 16, ["onUpdate:modelValue"]), [
                          [vModelCheckbox, unref(isNetworkAdmin)]
                        ]),
                        createTextVNode(" ネットワーク管理 ")
                      ]),
                      createVNode("label", { class: "checkbox-label" }, [
                        withDirectives(createVNode("input", mergeProps({
                          type: "checkbox",
                          "onUpdate:modelValue": ($event) => isRef(isNodeAdmin) ? isNodeAdmin.value = $event : null
                        }, unref(isNodeAdminAttrs)), null, 16, ["onUpdate:modelValue"]), [
                          [vModelCheckbox, unref(isNodeAdmin)]
                        ]),
                        createTextVNode(" ノード管理 ")
                      ]),
                      createVNode("label", { class: "checkbox-label" }, [
                        withDirectives(createVNode("input", mergeProps({
                          type: "checkbox",
                          "onUpdate:modelValue": ($event) => isRef(isSecurityGroupAdmin) ? isSecurityGroupAdmin.value = $event : null
                        }, unref(isSecurityGroupAdminAttrs)), null, 16, ["onUpdate:modelValue"]), [
                          [vModelCheckbox, unref(isSecurityGroupAdmin)]
                        ]),
                        createTextVNode(" セキュリティグループ管理 ")
                      ]),
                      createVNode("label", { class: "checkbox-label" }, [
                        withDirectives(createVNode("input", mergeProps({
                          type: "checkbox",
                          "onUpdate:modelValue": ($event) => isRef(isVirtualMachineAdmin) ? isVirtualMachineAdmin.value = $event : null
                        }, unref(isVirtualMachineAdminAttrs)), null, 16, ["onUpdate:modelValue"]), [
                          [vModelCheckbox, unref(isVirtualMachineAdmin)]
                        ]),
                        createTextVNode(" 仮想マシン管理 ")
                      ])
                    ])
                  ]),
                  _: 1
                })
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/MoUserEdit.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const MoUserEdit = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main, [["__scopeId", "data-v-23fdd41a"]]), { __name: "MoUserEdit" });

export { MoUserEdit as M };
//# sourceMappingURL=MoUserEdit-CgkziSP5.mjs.map
