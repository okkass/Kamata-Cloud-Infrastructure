<template>
  <div class="relative min-h-screen bg-white">
    <DefaultHeader />
    <div class="flex">
      <UserSidebar :isAdmin="isAdmin" />
      <main class="flex-1 p-8 transition-all duration-300">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUser } from "~/composables/useUser";
import UserSidebar from "~/components/Sidebar.vue";
import DefaultHeader from "~/components/DefaultHeader.vue";
const { isAdmin, fetchUser } = useUser();

onMounted(() => {
  fetchUser();
});
</script>
