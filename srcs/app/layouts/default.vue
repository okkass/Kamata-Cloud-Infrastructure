<template>
  <div class="relative flex min-h-screen bg-slate-100">
    <UserSidebar :isAdmin="isAdmin" />
    <main
      class="flex-1 p-8 transition-all duration-300"
      :class="{ 'ml-64': isSidebarOpen }"
    >
      <button
        v-if="!isSidebarOpen"
        @click="open"
        class="fixed top-4 left-4 z-50 p-2 bg-slate-800 text-white rounded-md hover:bg-slate-700"
      >
        <IconMenu />
      </button>
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

import { useSidebar } from "~/composables/useSidebar";

import UserSidebar from "~/components/Sidebar.vue";

// Composableから状態と関数を取得

const { isSidebarOpen, open } = useSidebar();

// ユーザー情報を取得してisAdminを設定

const { data } = await useFetch("/api/user/me", { method: "GET" });

// レスポンスがエラーの場合はfalse
const isAdmin = ref(
  data.value &&
    "isAdmin" in data.value &&
    typeof (data.value as any).isAdmin === "boolean"
    ? (data.value as any).isAdmin
    : false
);
</script>
