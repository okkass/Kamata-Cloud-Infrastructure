import __nuxt_component_1 from './index-CICjSpIO.mjs';
import { F as FormInput } from './Input-jfnKbGQs.mjs';
import { defineComponent, mergeProps, unref, isRef, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import { u as useToast, a as useRuntimeConfig, n as navigateTo } from './server.mjs';
import './composables-BRf5lMQQ.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
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
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import './asyncData-BDnIU8Sz.mjs';
import 'perfect-debounce';
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "login",
  __ssrInlineRender: true,
  setup(__props) {
    const validationSchema = toTypedSchema(
      z.object({
        userName: z.string().min(1, "メールアドレスは必須です。"),
        password: z.string().min(1, "パスワードを入力してください。")
      })
    );
    const { errors, defineField, handleSubmit } = useForm({
      validationSchema,
      initialValues: {
        userName: "",
        password: ""
      }
    });
    const [userName, userNameAttrs] = defineField("userName");
    const [password, passwordAttrs] = defineField("password");
    const { addToast } = useToast();
    handleSubmit(async (values) => {
      const runtimeConfig = useRuntimeConfig();
      try {
        const dto = {
          email: values.userName,
          password: values.password
        };
        const url = runtimeConfig.public.apiBaseUrl + "auth/login";
        console.log("Submitting login request to:", url);
        await $fetch(url, {
          method: "POST",
          body: dto
        });
        await navigateTo("/");
      } catch (error) {
        console.error("Login failed:", error);
        addToast({
          type: "error",
          message: "ログインに失敗しました",
          details: error.data?.message || "メールアドレスまたはパスワードが正しくありません。"
        });
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = __nuxt_component_1;
      const _component_FormInput = FormInput;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex min-h-screen items-center justify-center bg-gray-100 px-4" }, _attrs))}><div class="w-full max-w-md rounded-lg bg-white p-8 shadow-lg"><div class="flex flex-col items-center justify-center mb-6"><p class="text-xl font-semibold text-gray-800"> Kamata-Cloud-Infrastrucuture </p>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "images:logo",
        size: "200",
        class: "text-blue-600"
      }, null, _parent));
      _push(`<p class="mb-1 text-xl font-semibold text-gray-800">ログイン</p></div><form class="space-y-6">`);
      _push(ssrRenderComponent(_component_FormInput, {
        label: "メールアドレス",
        name: "username",
        type: "text",
        modelValue: unref(userName),
        "onUpdate:modelValue": ($event) => isRef(userName) ? userName.value = $event : null,
        attrs: unref(userNameAttrs),
        "onUpdate:attrs": ($event) => isRef(userNameAttrs) ? userNameAttrs.value = $event : null,
        error: unref(errors).userName,
        required: true
      }, null, _parent));
      _push(ssrRenderComponent(_component_FormInput, {
        label: "パスワード",
        name: "password",
        type: "password",
        modelValue: unref(password),
        "onUpdate:modelValue": ($event) => isRef(password) ? password.value = $event : null,
        attrs: unref(passwordAttrs),
        "onUpdate:attrs": ($event) => isRef(passwordAttrs) ? passwordAttrs.value = $event : null,
        error: unref(errors).password,
        required: true
      }, null, _parent));
      _push(`<div><button type="submit" class="btn btn-primary flex w-full justify-center"> ログイン </button></div></form></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/login.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=login-BCwYgwUA.mjs.map
