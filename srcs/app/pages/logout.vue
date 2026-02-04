<template>
  <h1>ログアウトしました</h1>
</template>

<script setup lang="ts">
// /api/auth/logoutを呼び出してセッションを破棄
import { onMounted } from "vue";

onMounted(async () => {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    // 1秒後にトップページにリダイレクト
    setTimeout(() => {
      window.location.href = "/";
    }, 1000);
  } catch (error) {
    console.error("Logout failed:", error);
  }
});
</script>
