<!-- 未定義ルートのキャッチオール。即座に/error?code=404&from=...へリダイレクトしSSRでも404を返す。 -->
<template>
  <!-- ここは表示されない想定（即リダイレクト） -->
  <div />
</template>

<script setup lang="ts">
import { setResponseStatus } from "h3";

const route = useRoute();
const event = useRequestEvent();

// SSRでも 404 を返す
if (event) setResponseStatus(event, 404);

await navigateTo(
  {
    path: "/error",
    query: {
      code: "404",
      from: route.fullPath,
    },
  },
  { replace: true },
);
</script>
