<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-100 px-4">
    <div class="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
      <div class="flex flex-col items-center justify-center mb-6">
        <p class="text-xl font-semibold text-gray-800">
          Kamata-Cloud-Infrastrucuture
        </p>
        <Icon name="images:logo" size="200" class="text-blue-600" />
        <p class="mb-1 text-xl font-semibold text-gray-800">ログイン</p>
      </div>
      <form class="space-y-6" @submit.prevent="onSubmit">
        <FormInput
          label="メールアドレス"
          name="username"
          type="text"
          v-model="userName"
          v-model:attrs="userNameAttrs"
          :error="errors.userName"
          :required="true"
        />

        <FormInput
          label="パスワード"
          name="password"
          type="password"
          v-model="password"
          v-model:attrs="passwordAttrs"
          :error="errors.password"
          :required="true"
        />

        <div>
          <button
            type="submit"
            class="btn btn-primary flex w-full justify-center"
          >
            ログイン
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * ログインページ (login.vue)
 * =================================================================================
 */
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import type { LoginRequest } from "#imports";

// サイドバーなどを表示しない専用のレイアウトを指定
definePageMeta({ layout: "login" });

/**
 * ==============================================================================
 * Validation Schema (バリデーションスキーマ)
 * ------------------------------------------------------------------------------
 * ログインフォームの入力ルールをZodで定義します。
 * ==============================================================================
 */
const validationSchema = toTypedSchema(
  z.object({
    userName: z.string().min(1, "ユーザー名またはメールアドレスは必須です。"),
    password: z.string().min(1, "パスワードを入力してください。"),
  }),
);

/**
 * ==============================================================================
 * Form State Management (フォーム状態管理)
 * ------------------------------------------------------------------------------
 * VeeValidateのuseFormを使い、フォーム全体の状態を管理します。
 * ==============================================================================
 */
const { errors, defineField, handleSubmit } = useForm({
  validationSchema,
  initialValues: {
    userName: "",
    password: "",
  },
});

const [userName, userNameAttrs] = defineField("userName");
const [password, passwordAttrs] = defineField("password");

// --- Composables ---
const { addToast } = useToast();

/**
 * ==============================================================================
 * Event Handler (イベントハンドラ)
 * ------------------------------------------------------------------------------
 * フォームの送信処理を定義します。
 * ==============================================================================
 */
const onSubmit = handleSubmit(async (values) => {
  const runtimeConfig = useRuntimeConfig();

  try {
    const dto: LoginRequest = {
      email: values.userName,
      password: values.password,
    };
    const url = runtimeConfig.public.apiBaseUrl + "auth/login";
    console.log("Submitting login request to:", url);
    await $fetch(url, {
      method: "POST",
      body: dto,
    });

    // ログイン成功後にホーム画面へリダイレクト
    await navigateTo("/");
  } catch (error: any) {
    console.error("Login failed:", error);
    addToast({
      type: "error",
      message: "ログインに失敗しました",
      details:
        error.data?.message || "ユーザー名またはパスワードが正しくありません。",
    });
  }
});
</script>
