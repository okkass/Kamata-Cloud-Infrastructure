<template>
  <div class="p-6">
    <component :is="summaryComponent" />
  </div>
</template>

<script setup lang="ts">
import SummaryAdmin from "@/components/Summary/Admin.vue";
import SummaryUser from "@/components/Summary/User.vue";
const { isAdmin } = useUserPermission();
const summaryComponent = computed(() => {
  return isAdmin.value ? SummaryAdmin : SummaryUser;
});
</script>
