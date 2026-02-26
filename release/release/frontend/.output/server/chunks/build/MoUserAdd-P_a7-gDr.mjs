import { _ as _sfc_main$1 } from './BaseModal-XreF1fHA.mjs';
import { U as UiSubmitButton } from './SubmitButton-BLZt3uil.mjs';
import { defineComponent, mergeProps, unref, withCtx, isRef, createVNode, createBlock, openBlock, Fragment, renderList, withDirectives, createTextVNode, vModelCheckbox, toDisplayString, withModifiers, computed, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrIncludeBooleanAttr, ssrLooseContain } from 'vue/server-renderer';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { u as useResourceCreate } from './useResourceCreate-C_T3ufwz.mjs';
import { _ as _export_sfc, q as convertUnitToByte } from './server.mjs';
import { a as UserSchema } from './user-BB0TVvYL.mjs';
import { u as useFormAction } from './useModalAction-CCl6IdMe.mjs';
import { U as USER } from './fetch-kOzZWayB.mjs';
import { F as FormInput } from './Input-jfnKbGQs.mjs';
import { _ as __nuxt_component_1 } from './Section-B8lyqO8a.mjs';

function useUserAddForm() {
  const { handleFormSubmit, makeHandleClose: createHandleClose } = useFormAction();
  const { executeCreate, isCreating } = useResourceCreate(USER.name);
  const { errors, defineField, handleSubmit, resetForm, meta } = useForm({
    validationSchema: toTypedSchema(UserSchema),
    initialValues: {
      name: "",
      email: "",
      password: "",
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
  const [password, passwordAttrs] = defineField("password");
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
  const permissions = {
    isAdmin: { label: "全体管理者", value: isAdmin },
    isImageAdmin: { label: "イメージ管理", value: isImageAdmin },
    isInstanceTypeAdmin: {
      label: "インスタンスタイプ管理",
      value: isInstanceTypeAdmin
    },
    isNetworkAdmin: { label: "ネットワーク管理", value: isNetworkAdmin },
    isNodeAdmin: { label: "ノード管理", value: isNodeAdmin },
    isSecurityGroupAdmin: {
      label: "セキュリティグループ管理",
      value: isSecurityGroupAdmin
    },
    isVirtualMachineAdmin: {
      label: "仮想マシン管理",
      value: isVirtualMachineAdmin
    }
  };
  const onFormSubmit = (emit) => handleFormSubmit(
    handleSubmit,
    {
      execute: async (formValues) => {
        const payload = {
          name: formValues.name,
          email: formValues.email,
          password: formValues.password,
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
        return await executeCreate(payload);
      },
      onSuccessMessage: (payload) => `利用者「${payload.name}」を作成しました。`,
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
    password,
    passwordAttrs,
    maxCpuCore,
    maxCpuCoreAttrs,
    maxMemorySize,
    maxMemorySizeAttrs,
    maxStorageSize,
    maxStorageSizeAttrs,
    // 権限
    permissions,
    // 状態
    isValid: computed(() => meta.value.valid),
    isCreating,
    onFormSubmit,
    makeHandleClose
  };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "MoUserAdd",
  __ssrInlineRender: true,
  props: { show: { type: Boolean, required: true } },
  emits: ["close", "success"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const {
      errors,
      isValid,
      // フォームフィールド群
      name,
      nameAttrs,
      email,
      emailAttrs,
      password,
      passwordAttrs,
      maxCpuCore,
      maxCpuCoreAttrs,
      maxMemorySize,
      maxMemorySizeAttrs,
      maxStorageSize,
      maxStorageSizeAttrs,
      permissions,
      // 状態とアクション
      isCreating,
      onFormSubmit,
      makeHandleClose
    } = useUserAddForm();
    const handleClose = makeHandleClose(emit);
    const onSubmit = onFormSubmit(emit);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_BaseModal = _sfc_main$1;
      const _component_UiSubmitButton = UiSubmitButton;
      _push(ssrRenderComponent(_component_BaseModal, mergeProps({
        show: __props.show,
        title: "利用者の追加",
        onClose: unref(handleClose)
      }, _attrs), {
        footer: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="modal-footer" data-v-b900fd4c${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UiSubmitButton, {
              form: "user-add-form",
              type: "submit",
              label: "利用者を追加",
              disabled: !unref(isValid),
              loading: unref(isCreating)
            }, null, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "modal-footer" }, [
                createVNode(_component_UiSubmitButton, {
                  form: "user-add-form",
                  type: "submit",
                  label: "利用者を追加",
                  disabled: !unref(isValid),
                  loading: unref(isCreating)
                }, null, 8, ["disabled", "loading"])
              ])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<form id="user-add-form" data-v-b900fd4c${_scopeId}>`);
            _push2(ssrRenderComponent(__nuxt_component_1, { title: "基本情報" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(FormInput, mergeProps({
                    label: "アカウント名",
                    name: "user-account-name-add",
                    type: "text",
                    modelValue: unref(name),
                    "onUpdate:modelValue": ($event) => isRef(name) ? name.value = $event : null
                  }, unref(nameAttrs), {
                    error: unref(errors).name,
                    required: true
                  }), null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(FormInput, mergeProps({
                    label: "メールアドレス",
                    name: "user-email-add",
                    type: "email",
                    modelValue: unref(email),
                    "onUpdate:modelValue": ($event) => isRef(email) ? email.value = $event : null
                  }, unref(emailAttrs), {
                    error: unref(errors).email,
                    required: true
                  }), null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(FormInput, mergeProps({
                    label: "パスワード",
                    name: "user-password-add",
                    type: "password",
                    modelValue: unref(password),
                    "onUpdate:modelValue": ($event) => isRef(password) ? password.value = $event : null
                  }, unref(passwordAttrs), {
                    error: unref(errors).password,
                    required: true
                  }), null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(FormInput, mergeProps({
                      label: "アカウント名",
                      name: "user-account-name-add",
                      type: "text",
                      modelValue: unref(name),
                      "onUpdate:modelValue": ($event) => isRef(name) ? name.value = $event : null
                    }, unref(nameAttrs), {
                      error: unref(errors).name,
                      required: true
                    }), null, 16, ["modelValue", "onUpdate:modelValue", "error"]),
                    createVNode(FormInput, mergeProps({
                      label: "メールアドレス",
                      name: "user-email-add",
                      type: "email",
                      modelValue: unref(email),
                      "onUpdate:modelValue": ($event) => isRef(email) ? email.value = $event : null
                    }, unref(emailAttrs), {
                      error: unref(errors).email,
                      required: true
                    }), null, 16, ["modelValue", "onUpdate:modelValue", "error"]),
                    createVNode(FormInput, mergeProps({
                      label: "パスワード",
                      name: "user-password-add",
                      type: "password",
                      modelValue: unref(password),
                      "onUpdate:modelValue": ($event) => isRef(password) ? password.value = $event : null
                    }, unref(passwordAttrs), {
                      error: unref(errors).password,
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
                    name: "user-max-cpu-add",
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
                    name: "user-max-memory-add",
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
                    name: "user-max-storage-add",
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
                      name: "user-max-cpu-add",
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
                      name: "user-max-memory-add",
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
                      name: "user-max-storage-add",
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
                  _push3(`<div class="checkbox-grid" data-v-b900fd4c${_scopeId2}><!--[-->`);
                  ssrRenderList(unref(permissions), (perm, index) => {
                    _push3(`<label class="checkbox-label" data-v-b900fd4c${_scopeId2}><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(perm.value) ? ssrLooseContain(perm.value, null) : perm.value) ? " checked" : ""} data-v-b900fd4c${_scopeId2}> ${ssrInterpolate(perm.label)}</label>`);
                  });
                  _push3(`<!--]--></div>`);
                } else {
                  return [
                    createVNode("div", { class: "checkbox-grid" }, [
                      (openBlock(true), createBlock(Fragment, null, renderList(unref(permissions), (perm, index) => {
                        return openBlock(), createBlock("label", {
                          key: index,
                          class: "checkbox-label"
                        }, [
                          withDirectives(createVNode("input", {
                            type: "checkbox",
                            "onUpdate:modelValue": ($event) => perm.value = $event
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelCheckbox, perm.value]
                          ]),
                          createTextVNode(" " + toDisplayString(perm.label), 1)
                        ]);
                      }), 128))
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
                id: "user-add-form",
                onSubmit: withModifiers(unref(onSubmit), ["prevent"])
              }, [
                createVNode(__nuxt_component_1, { title: "基本情報" }, {
                  default: withCtx(() => [
                    createVNode(FormInput, mergeProps({
                      label: "アカウント名",
                      name: "user-account-name-add",
                      type: "text",
                      modelValue: unref(name),
                      "onUpdate:modelValue": ($event) => isRef(name) ? name.value = $event : null
                    }, unref(nameAttrs), {
                      error: unref(errors).name,
                      required: true
                    }), null, 16, ["modelValue", "onUpdate:modelValue", "error"]),
                    createVNode(FormInput, mergeProps({
                      label: "メールアドレス",
                      name: "user-email-add",
                      type: "email",
                      modelValue: unref(email),
                      "onUpdate:modelValue": ($event) => isRef(email) ? email.value = $event : null
                    }, unref(emailAttrs), {
                      error: unref(errors).email,
                      required: true
                    }), null, 16, ["modelValue", "onUpdate:modelValue", "error"]),
                    createVNode(FormInput, mergeProps({
                      label: "パスワード",
                      name: "user-password-add",
                      type: "password",
                      modelValue: unref(password),
                      "onUpdate:modelValue": ($event) => isRef(password) ? password.value = $event : null
                    }, unref(passwordAttrs), {
                      error: unref(errors).password,
                      required: true
                    }), null, 16, ["modelValue", "onUpdate:modelValue", "error"])
                  ]),
                  _: 1
                }),
                createVNode(__nuxt_component_1, { title: "リソースクォータ (上限なしの場合は空欄)" }, {
                  default: withCtx(() => [
                    createVNode(FormInput, mergeProps({
                      label: "最大vCPU (コア)",
                      name: "user-max-cpu-add",
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
                      name: "user-max-memory-add",
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
                      name: "user-max-storage-add",
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
                      (openBlock(true), createBlock(Fragment, null, renderList(unref(permissions), (perm, index) => {
                        return openBlock(), createBlock("label", {
                          key: index,
                          class: "checkbox-label"
                        }, [
                          withDirectives(createVNode("input", {
                            type: "checkbox",
                            "onUpdate:modelValue": ($event) => perm.value = $event
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelCheckbox, perm.value]
                          ]),
                          createTextVNode(" " + toDisplayString(perm.label), 1)
                        ]);
                      }), 128))
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/MoUserAdd.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const MoUserAdd = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main, [["__scopeId", "data-v-b900fd4c"]]), { __name: "MoUserAdd" });

export { MoUserAdd as M };
//# sourceMappingURL=MoUserAdd-P_a7-gDr.mjs.map
