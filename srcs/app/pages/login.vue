<template>
  <div>
    <form>
      <label for="username">ユーザー名 または メールアドレス</label>
      <input type="text" id="username" v-model="userName" required />

      <label for="password">パスワード</label>
      <input type="password" id="password" v-model="password" required />

      <button type="button" @click="onSubmit">ログイン</button>
    </form>
  </div>
</template>

<script setup lang="ts">
// サイドバーの表示をさせないためにloginレイアウトを使用
definePageMeta({ layout: "login" });

// 型安全にするためにDTOをインポート
import type { LoginRequestDTO } from "#imports";

const { addToast } = useToast();

// フォームのデータを保持するためのref
const userName = ref("");
const password = ref("");

// フォームの送信処理
const onSubmit = async () => {
  try {
    const dto: LoginRequestDTO = {
      email: userName.value,
      password: password.value,
    };
    // APIエンドポイントにPOSTリクエストを送信
    await $fetch("/api/login/web", {
      method: "POST",
      body: dto,
    });

    // ログイン成功後にホームにリダイレクト
    await navigateTo("/");
  } catch (error: any) {
    // エラーハンドリング
    addToast({
      type: "error",
      message: "ログインに失敗しました",
      details: error.message,
    });
  }
};
</script>
