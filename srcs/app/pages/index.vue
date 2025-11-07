<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold mb-6">ダッシュボードサマリー</h1>

    <div>
      <button @click="isAdmin = !isAdmin" class="mb-4 btn btn-primary">
        {{ isAdmin ? "管理者モードを解除" : "管理者モードに切替" }}
      </button>
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
