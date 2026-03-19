<!-- Nuxtのエラーフックを受けてAppErrorPageを表示するエラーページ。レイアウト無効化で単独表示。 -->
<template>
  <AppErrorPage
    :code="statusCode"
    :title="title"
    :message="message"
    :from="from"
    :showDetails="true"
  />
</template>

<script setup lang="ts">
import AppErrorPage from "@/components/AppErrorPage.vue";

// error.vueでレイアウトを無効化
defineProps({
  error: Object,
});

const nuxtError = useError();

// デバッグ用: エラーオブジェクトをログ出力
if (process.client) {
  console.log("🔴 Error Page - Nuxt Error Object:", nuxtError.value);
}

const statusCode = computed(() => nuxtError.value?.statusCode ?? 500);

const title = computed(() => {
  // statusMessageがあればそれを使用、なければundefined（AppErrorPageでデフォルト表示）
  const statusMsg = nuxtError.value?.statusMessage;
  return statusMsg && statusMsg.trim() !== "" ? statusMsg : undefined;
});

const message = computed(() => {
  const err = nuxtError.value as any;

  // 1. dataプロパティからJSONエラーメッセージを抽出（RFC 9457 ErrorResponse形式）
  if (err?.data) {
    // API レスポンスの data.detail を優先（RFC 9457準拠）
    if (typeof err.data.detail === "string" && err.data.detail.trim()) {
      return err.data.detail;
    }
    // data.message も確認（後方互換性）
    if (typeof err.data.message === "string" && err.data.message.trim()) {
      return err.data.message;
    }
    // data.title も確認
    if (typeof err.data.title === "string" && err.data.title.trim()) {
      return err.data.title;
    }
    // data.error も確認
    if (typeof err.data.error === "string" && err.data.error.trim()) {
      return err.data.error;
    }
    // dataが文字列の場合
    if (typeof err.data === "string" && err.data.trim()) {
      return err.data;
    }
  }

  // 2. message プロパティ（通常のエラーメッセージ）
  if (typeof err?.message === "string" && err.message.trim()) {
    return err.message;
  }

  // 3. メッセージがない場合はundefined（AppErrorPageでデフォルト表示）
  return undefined;
});

const from = computed(() =>
  process.client ? window.location.pathname + window.location.search : "",
);
</script>
