<template>
  <div class="relative flex">
    <UserSidebar :role="userRole" />

    <main class="flex-1 ml-64 p-8">
      <slot />
    </main>
  </div>
</template>
<script setup>
import { ref } from "vue";
import UserSidebar from "~/components/UserSidebar.vue"; // コンポーネントのパスは適宜調整

// 本来は認証情報などから動的に取得しますが、ここでは仮のデータを使います。
// 'admin' または 'user' を切り替えて表示を確認できます。
//const userRole = ref("admin");
const userRole = ref("user");
</script>
