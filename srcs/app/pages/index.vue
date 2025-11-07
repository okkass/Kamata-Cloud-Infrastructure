<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold mb-6">ダッシュボードサマリー</h1>

    <div>
      <button
        @click="isAdmin = !isAdmin"
        class="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        {{ isAdmin ? "管理者モードを解除" : "管理者モードに切替" }}
      </button>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <NuxtLink to="/virtual-machine" class="quick-link">VM管理</NuxtLink>
      <NuxtLink to="/storage-pool" class="quick-link">ストレージ</NuxtLink>
      <NuxtLink to="/security-group" class="quick-link">セキュリティ</NuxtLink>
      <NuxtLink to="/profile" class="quick-link">アカウント</NuxtLink>
    </div>

    <component :is="summaryComponent" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import SummaryUser from "~/components/Summary/User.vue";
import SummaryAdmin from "~/components/Summary/Admin.vue";

// 実際には useAuth() コンポーザブルなどから取得する
let isAdmin = ref(true);

// isAdmin の値に応じて、表示するコンポーネントを返す
const summaryComponent = computed(() => {
  return isAdmin.value ? SummaryAdmin : SummaryUser;
});
</script>

<style scoped>

</style>
