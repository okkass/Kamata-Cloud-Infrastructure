import { U as UiSubmitButton } from './SubmitButton-BLZt3uil.mjs';
import { defineComponent, ref, computed, mergeProps, withCtx, unref, isRef, createVNode, toDisplayString, watch, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrInterpolate } from 'vue/server-renderer';
import { F as FormInput } from './Input-jfnKbGQs.mjs';
import { _ as __nuxt_component_1 } from './Section-B8lyqO8a.mjs';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { U as UserClientUpdateSchema } from './user-BB0TVvYL.mjs';
import { u as useToast } from './server.mjs';
import { u as useUserPermission } from './useUserPermission-CgOheY55.mjs';
import { e as extractErrorMessage } from './errorHandler-Bj20B0ou.mjs';
import { u as useApiClient } from './useResourceClient-CRkQUuKV.mjs';
import { u as useResourceDetail } from './useResourceDetail-BPCZWJMv.mjs';
import { M as ME } from './fetch-kOzZWayB.mjs';
import 'zod';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '@iconify/utils';
import 'consola';
import 'vue-router';
import './asyncData-BDnIU8Sz.mjs';
import 'perfect-debounce';

const hasPasswordChangeIntent = (cpValue, npValue, ncValue) => {
  const currentPwd = (cpValue ?? "").trim();
  const newPwd = (npValue ?? "").trim();
  const newPwdConfirm = (ncValue ?? "").trim();
  return currentPwd !== "" || newPwd !== "" || newPwdConfirm !== "";
};
const getErrorMessage = (error, defaultMessage = "更新に失敗しました。") => {
  return extractErrorMessage(error, defaultMessage);
};
const useUserSettingsForm = (props) => {
  const { addToast } = useToast();
  const isUpdating = ref(false);
  const client = useApiClient();
  const { user } = useUserPermission();
  const { errors, meta, defineField, handleSubmit, resetForm } = useForm({
    validationSchema: toTypedSchema(UserClientUpdateSchema),
    initialValues: {
      name: props.data.value?.name ?? "",
      email: props.data.value?.email ?? "",
      currentPassword: "",
      newPassword: "",
      newPasswordConfirm: ""
    }
  });
  const isValid = computed(() => meta.value.valid);
  const [name, nameAttrs] = defineField("name");
  const [email, emailAttrs] = defineField("email");
  const [currentPassword, currentPasswordAttrs] = defineField("currentPassword");
  const [newPassword, newPasswordAttrs] = defineField("newPassword");
  const [newPasswordConfirm, newPasswordConfirmAttrs] = defineField("newPasswordConfirm");
  const wantsPasswordChange = computed(
    () => hasPasswordChangeIntent(
      currentPassword.value,
      newPassword.value,
      newPasswordConfirm.value
    )
  );
  const buildPayload = () => {
    return {
      name: name.value,
      email: email.value
    };
  };
  const buildPasswordChangePayload = () => {
    return {
      currentPassword: (currentPassword.value ?? "").trim(),
      newPassword: (newPassword.value ?? "").trim()
    };
  };
  const updateMe = async (payload, id) => {
    await client.patch(`/users/${id}`, payload);
  };
  const changePassword = async (payload, id) => {
    await client.post(`/users/${id}/change-password`, payload);
  };
  const onFormSubmit = () => handleSubmit(async () => {
    try {
      isUpdating.value = true;
      const userId = user.value?.id ?? "";
      const payload = buildPayload();
      await updateMe(payload, userId);
      if (wantsPasswordChange.value) {
        const passwordPayload = buildPasswordChangePayload();
        try {
          await changePassword(passwordPayload, userId);
          addToast({
            type: "success",
            message: "設定とパスワードを更新しました。"
          });
        } catch (passwordError) {
          const passwordMsg = getErrorMessage(
            passwordError,
            "パスワード変更に失敗しました。"
          );
          addToast({ type: "error", message: passwordMsg });
          return;
        }
      } else {
        addToast({ type: "success", message: "設定を更新しました。" });
      }
      resetForm({
        values: {
          name: name.value,
          email: email.value,
          currentPassword: "",
          newPassword: "",
          newPasswordConfirm: ""
        }
      });
    } catch (error) {
      const msg = getErrorMessage(error);
      addToast({ type: "error", message: msg });
    } finally {
      isUpdating.value = false;
    }
  });
  watch(
    () => props.data.value,
    (v) => {
      if (!v) return;
      resetForm({
        values: {
          name: v.name,
          email: v.email,
          currentPassword: "",
          newPassword: "",
          newPasswordConfirm: ""
        }
      });
    },
    { immediate: true }
  );
  return {
    errors,
    isValid,
    name,
    nameAttrs,
    email,
    emailAttrs,
    currentPassword,
    currentPasswordAttrs,
    newPassword,
    newPasswordAttrs,
    newPasswordConfirm,
    newPasswordConfirmAttrs,
    wantsPasswordChange,
    isUpdating,
    onFormSubmit
  };
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "settings",
  __ssrInlineRender: true,
  setup(__props) {
    useUserPermission();
    ref("");
    const { data: userData } = useResourceDetail(ME.name);
    const me = computed(() => userData.value ?? null);
    const showCurrentPassword = ref(false);
    const showNewPassword = ref(false);
    const showNewPasswordConfirm = ref(false);
    const {
      errors,
      isValid,
      name,
      nameAttrs,
      email,
      emailAttrs,
      currentPassword,
      currentPasswordAttrs,
      newPassword,
      newPasswordAttrs,
      newPasswordConfirm,
      newPasswordConfirmAttrs,
      wantsPasswordChange,
      isUpdating,
      onFormSubmit
    } = useUserSettingsForm({ data: me });
    onFormSubmit();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiSubmitButton = UiSubmitButton;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "py-2" }, _attrs))}><div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"><div class="bg-white rounded-lg shadow-sm p-6 sm:p-8 space-y-6"><h1 class="text-2xl font-bold text-gray-900">ユーザー設定</h1><form id="user-settings-form">`);
      _push(ssrRenderComponent(__nuxt_component_1, { title: "基本情報" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(FormInput, mergeProps({
              label: "ユーザー名",
              name: "settings-user-name",
              type: "text",
              modelValue: unref(name),
              "onUpdate:modelValue": ($event) => isRef(name) ? name.value = $event : null
            }, unref(nameAttrs), {
              error: unref(errors).name,
              required: true
            }), null, _parent2, _scopeId));
            _push2(ssrRenderComponent(FormInput, mergeProps({
              label: "メールアドレス",
              name: "settings-user-email",
              type: "email",
              modelValue: unref(email),
              "onUpdate:modelValue": ($event) => isRef(email) ? email.value = $event : null
            }, unref(emailAttrs), {
              error: unref(errors).email,
              required: true
            }), null, _parent2, _scopeId));
          } else {
            return [
              createVNode(FormInput, mergeProps({
                label: "ユーザー名",
                name: "settings-user-name",
                type: "text",
                modelValue: unref(name),
                "onUpdate:modelValue": ($event) => isRef(name) ? name.value = $event : null
              }, unref(nameAttrs), {
                error: unref(errors).name,
                required: true
              }), null, 16, ["modelValue", "onUpdate:modelValue", "error"]),
              createVNode(FormInput, mergeProps({
                label: "メールアドレス",
                name: "settings-user-email",
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
      }, _parent));
      _push(`<div class="mt-2">`);
      _push(ssrRenderComponent(__nuxt_component_1, { title: "パスワード変更" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<p class="text-sm text-gray-500 mb-4"${_scopeId}> パスワードを変更しない場合は、以下を空欄のままにしてください。 </p><div class="relative"${_scopeId}>`);
            _push2(ssrRenderComponent(FormInput, mergeProps({
              label: "現在のパスワード",
              name: "settings-current-password",
              type: unref(showCurrentPassword) ? "text" : "password",
              modelValue: unref(currentPassword),
              "onUpdate:modelValue": ($event) => isRef(currentPassword) ? currentPassword.value = $event : null
            }, unref(currentPasswordAttrs), {
              error: unref(errors).currentPassword,
              required: unref(wantsPasswordChange)
            }), null, _parent2, _scopeId));
            _push2(`<button type="button" class="absolute right-3 top-[38px] text-sm text-gray-600 hover:text-gray-900"${ssrRenderAttr(
              "aria-label",
              unref(showCurrentPassword) ? "現在のパスワードを隠す" : "現在のパスワードを表示"
            )}${_scopeId}>${ssrInterpolate(unref(showCurrentPassword) ? "隠す" : "表示")}</button></div><div class="relative"${_scopeId}>`);
            _push2(ssrRenderComponent(FormInput, mergeProps({
              label: "新しいパスワード",
              name: "settings-new-password",
              type: unref(showNewPassword) ? "text" : "password",
              modelValue: unref(newPassword),
              "onUpdate:modelValue": ($event) => isRef(newPassword) ? newPassword.value = $event : null
            }, unref(newPasswordAttrs), {
              error: unref(errors).newPassword,
              required: unref(wantsPasswordChange)
            }), null, _parent2, _scopeId));
            _push2(`<button type="button" class="absolute right-3 top-[38px] text-sm text-gray-600 hover:text-gray-900"${ssrRenderAttr(
              "aria-label",
              unref(showNewPassword) ? "新しいパスワードを隠す" : "新しいパスワードを表示"
            )}${_scopeId}>${ssrInterpolate(unref(showNewPassword) ? "隠す" : "表示")}</button></div><div class="relative"${_scopeId}>`);
            _push2(ssrRenderComponent(FormInput, mergeProps({
              label: "新しいパスワード（確認）",
              name: "settings-new-password-confirm",
              type: unref(showNewPasswordConfirm) ? "text" : "password",
              modelValue: unref(newPasswordConfirm),
              "onUpdate:modelValue": ($event) => isRef(newPasswordConfirm) ? newPasswordConfirm.value = $event : null
            }, unref(newPasswordConfirmAttrs), {
              error: unref(errors).newPasswordConfirm,
              required: unref(wantsPasswordChange)
            }), null, _parent2, _scopeId));
            _push2(`<button type="button" class="absolute right-3 top-[38px] text-sm text-gray-600 hover:text-gray-900"${ssrRenderAttr(
              "aria-label",
              unref(showNewPasswordConfirm) ? "パスワード確認を隠す" : "パスワード確認を表示"
            )}${_scopeId}>${ssrInterpolate(unref(showNewPasswordConfirm) ? "隠す" : "表示")}</button></div>`);
          } else {
            return [
              createVNode("p", { class: "text-sm text-gray-500 mb-4" }, " パスワードを変更しない場合は、以下を空欄のままにしてください。 "),
              createVNode("div", { class: "relative" }, [
                createVNode(FormInput, mergeProps({
                  label: "現在のパスワード",
                  name: "settings-current-password",
                  type: unref(showCurrentPassword) ? "text" : "password",
                  modelValue: unref(currentPassword),
                  "onUpdate:modelValue": ($event) => isRef(currentPassword) ? currentPassword.value = $event : null
                }, unref(currentPasswordAttrs), {
                  error: unref(errors).currentPassword,
                  required: unref(wantsPasswordChange)
                }), null, 16, ["type", "modelValue", "onUpdate:modelValue", "error", "required"]),
                createVNode("button", {
                  type: "button",
                  class: "absolute right-3 top-[38px] text-sm text-gray-600 hover:text-gray-900",
                  onClick: ($event) => showCurrentPassword.value = !unref(showCurrentPassword),
                  "aria-label": unref(showCurrentPassword) ? "現在のパスワードを隠す" : "現在のパスワードを表示"
                }, toDisplayString(unref(showCurrentPassword) ? "隠す" : "表示"), 9, ["onClick", "aria-label"])
              ]),
              createVNode("div", { class: "relative" }, [
                createVNode(FormInput, mergeProps({
                  label: "新しいパスワード",
                  name: "settings-new-password",
                  type: unref(showNewPassword) ? "text" : "password",
                  modelValue: unref(newPassword),
                  "onUpdate:modelValue": ($event) => isRef(newPassword) ? newPassword.value = $event : null
                }, unref(newPasswordAttrs), {
                  error: unref(errors).newPassword,
                  required: unref(wantsPasswordChange)
                }), null, 16, ["type", "modelValue", "onUpdate:modelValue", "error", "required"]),
                createVNode("button", {
                  type: "button",
                  class: "absolute right-3 top-[38px] text-sm text-gray-600 hover:text-gray-900",
                  onClick: ($event) => showNewPassword.value = !unref(showNewPassword),
                  "aria-label": unref(showNewPassword) ? "新しいパスワードを隠す" : "新しいパスワードを表示"
                }, toDisplayString(unref(showNewPassword) ? "隠す" : "表示"), 9, ["onClick", "aria-label"])
              ]),
              createVNode("div", { class: "relative" }, [
                createVNode(FormInput, mergeProps({
                  label: "新しいパスワード（確認）",
                  name: "settings-new-password-confirm",
                  type: unref(showNewPasswordConfirm) ? "text" : "password",
                  modelValue: unref(newPasswordConfirm),
                  "onUpdate:modelValue": ($event) => isRef(newPasswordConfirm) ? newPasswordConfirm.value = $event : null
                }, unref(newPasswordConfirmAttrs), {
                  error: unref(errors).newPasswordConfirm,
                  required: unref(wantsPasswordChange)
                }), null, 16, ["type", "modelValue", "onUpdate:modelValue", "error", "required"]),
                createVNode("button", {
                  type: "button",
                  class: "absolute right-3 top-[38px] text-sm text-gray-600 hover:text-gray-900",
                  onClick: ($event) => showNewPasswordConfirm.value = !unref(showNewPasswordConfirm),
                  "aria-label": unref(showNewPasswordConfirm) ? "パスワード確認を隠す" : "パスワード確認を表示"
                }, toDisplayString(unref(showNewPasswordConfirm) ? "隠す" : "表示"), 9, ["onClick", "aria-label"])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></form><div class="flex justify-end pt-4 border-t border-gray-200">`);
      _push(ssrRenderComponent(_component_UiSubmitButton, {
        form: "user-settings-form",
        type: "submit",
        label: "保存",
        loading: unref(isUpdating),
        disabled: !unref(isValid)
      }, null, _parent));
      _push(`</div></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/settings.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=settings-DAvHB43Z.mjs.map
