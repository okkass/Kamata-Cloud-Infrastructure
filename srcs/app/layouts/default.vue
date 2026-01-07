<template>
  <div class="relative min-h-[calc(100vh-theme(spacing.16))] pt-8">
    <DefaultHeader />
    <div>
      <UserSidebar :isAdmin="isAdmin" />
      <main
        class="p-8 transition-all duration-300"
        :class="isSidebarOpen ? 'ml-56' : 'ml-8'"
      >
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserPermission } from "~/composables/useUserPermission";
import { useSidebar } from "~/composables/useSidebar"; // useSidebarをインポート
import UserSidebar from "~/components/Sidebar.vue";
import DefaultHeader from "~/components/DefaultHeader.vue";

const { isAdmin, fetchUser } = useUserPermission();
const { isSidebarOpen } = useSidebar(); // サイドバーの開閉状態を取得

onMounted(() => {
  fetchUser();
});
</script>
