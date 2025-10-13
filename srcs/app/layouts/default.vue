<template>
  <div class="relative min-h-screen">
    <DefaultHeader />
    <div>
      <UserSidebar :isAdmin="isAdmin" />
      <main
        class="p-8 transition-all duration-300 mt-8"
        :class="isSidebarOpen ? 'ml-64' : 'ml-16'"
      >
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUser } from "~/composables/useUser";
import { useSidebar } from "~/composables/useSidebar"; // useSidebarをインポート
import UserSidebar from "~/components/Sidebar.vue";
import DefaultHeader from "~/components/DefaultHeader.vue";

const { isAdmin, fetchUser } = useUser();
const { isSidebarOpen } = useSidebar(); // サイドバーの開閉状態を取得

onMounted(() => {
  fetchUser();
});
</script>
