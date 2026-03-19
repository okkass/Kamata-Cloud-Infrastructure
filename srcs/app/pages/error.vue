<!-- /error ルート用のクライアント側エラーページ。クエリのcode/msg/fromを受け取りAppErrorPageを描画する。 -->
<template>
  <AppErrorPage
    :code="code"
    :title="title"
    :message="message"
    :from="from"
    :showDetails="true"
  />
</template>

<script setup lang="ts">
import AppErrorPage from "@/components/AppErrorPage.vue";

const route = useRoute();

const code = computed(() => (route.query.code ?? "500").toString());
const from = computed(() => (route.query.from ?? "").toString());

const title = computed(() => {
  const c = Number(code.value);
  if (c === 404) return "ページが見つかりません";
  if (c === 403) return "アクセスできません";
  return "エラーが発生しました";
});

const message = computed(() => {
  const q = route.query.msg;
  if (typeof q === "string" && q.trim()) return q;
  const c = Number(code.value);
  if (c === 404) return "URLが存在しない、または削除された可能性があります。";
  return "前の画面に戻るか、トップに戻ってください。";
});

useHead({
  title: "Error",
  meta: [{ name: "robots", content: "noindex,nofollow" }],
});
</script>
