<script setup lang="ts">
import { ref } from "vue";

// Cookieの状態をリアクティブに監視
const authToken = useCookie("auth-token");

// APIからのレスポンスを格納するRef
const publicData = ref();
const publicError = ref(null);
const protectedData = ref(null);
const protectedError = ref(null);
const echoedHeaders = ref(null);

// 「ログイン」処理（テスト用のトークンをCookieにセット）
const login = () => {
  authToken.value = "my-secret-token";
};

// 「ログアウト」処理（Cookieを削除）
const logout = () => {
  // 有効期限を過去にしてCookieを削除
  authToken.value = null;
  // 保護APIの結果もクリア
  protectedData.value = null;
  protectedError.value = null;
};

// 公開APIを叩く関数
const fetchPublic = async () => {
  publicData.value = null;
  publicError.value = null;
  const { data, error } = await useApiFetch("/test/public");
  publicData.value = data.value;
  publicError.value = error.value;
};

// 保護APIを叩く関数
const fetchProtected = async () => {
  protectedData.value = null;
  protectedError.value = null;
  const { data, error } = await useApiFetch("/test/private");
  protectedData.value = data.value;
  protectedError.value = error.value;
};

const fetchWithCustomHeaders = async () => {
  echoedHeaders.value = null;
  try {
    // useApi$Fetchを使って、カスタムヘッダーを渡す
    const japaneseMessage = "こんにちは！クライアントからのテストです。";
    const data = await useApiFetch("/test/echo-header", {
      headers: {
        "X-Custom-Test-Header": encodeURIComponent(japaneseMessage),
        "X-Another-Header": "12345",
      },
    });
    echoedHeaders.value = data;
  } catch (e) {
    console.error(e);
  }
};
</script>

<template>
  <div style="font-family: sans-serif; display: grid; gap: 2rem; padding: 2rem">
    <h1>useApiFetch & Cookie テストページ</h1>

    <section style="border: 1px solid #ccc; padding: 1rem">
      <h2>1. Cookie操作</h2>
      <p>
        現在のトークン: <strong>{{ authToken || "なし" }}</strong>
      </p>
      <div style="display: flex; gap: 1rem">
        <button @click="login">ログイン (トークン設定)</button>
        <button @click="logout">ログアウト (トークン削除)</button>
      </div>
    </section>

    <section style="border: 1px solid #ccc; padding: 1rem">
      <h2>2. API実行</h2>
      <div style="display: flex; gap: 1rem">
        <button @click="fetchPublic">公開APIを叩く</button>
        <button @click="fetchProtected">保護APIを叩く</button>
        <button @click="fetchWithCustomHeaders">
          カスタムヘッダーを送信して確認
        </button>
      </div>
    </section>

    <section style="border: 1px solid #ccc; padding: 1rem">
      <h2>3. 結果表示</h2>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem">
        <div>
          <h3>公開APIの結果</h3>
          <div v-if="publicError" style="color: red">
            <p>エラーが発生しました:</p>
            <pre>{{ publicError }}</pre>
          </div>
          <div v-else-if="publicData">
            <pre>{{ publicData }}</pre>
          </div>
          <p v-else>未実行</p>
        </div>
        <div>
          <h3>保護APIの結果</h3>
          <div v-if="protectedError" style="color: red">
            <p>エラーが発生しました:</p>
            <pre>{{ protectedError }}</pre>
          </div>
          <div v-else-if="protectedData">
            <pre>{{ protectedData }}</pre>
          </div>
          <p v-else>未実行</p>
        </div>
        <div>
          <h3>ヘッダー確認APIの結果</h3>
          <div v-if="echoedHeaders">
            <pre>{{ echoedHeaders }}</pre>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
