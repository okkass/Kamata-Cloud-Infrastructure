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
               
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
                   
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />

                 
        </svg>

             
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

const { data } = await useFetch("/api/users/me", { method: "GET" });

const isAdmin = ref(data.value?.isAdmin ?? false);
</script>
