<template>
  <DashboardLayout
    title="ポートフォリオ公開用環境管理"
    :columns="columns"
    :rows="rows"
    rowKey="id"
    :headerButtons="headerButtons"
    @header-action="handleHeaderAction"
  >
    <template #cell-title="{ row }">
      <div>
        <a :href="row.link" target="_blank" rel="noopener" class="table-link">{{
          row.title
        }}</a>
      </div>
    </template>

    <template #cell-publishedAt="{ row }">
      <span>{{ row.publishedAt }}</span>
    </template>

    <template #cell-status="{ row }">
      <span :class="statusClass(row.status)">{{ row.status }}</span>
    </template>
  </DashboardLayout>
</template>

<script setup lang="ts">
import DashboardLayout from "@/components/DashboardLayout.vue";
import {
  usePublishEnvironment,
  CWP_MANAGE_URL,
  type PortfolioRow,
} from "@/composables/usepublish_environment";

const { columns, headerButtons, rows } = usePublishEnvironment();

function handleHeaderAction(action: string) {
  if (action === "open-wordpress") {
    window.open(CWP_MANAGE_URL, "_blank", "noopener,noreferrer");
  }
}

function statusClass(status: string) {
  return status === "公開中" ? "text-green-600" : "text-gray-500";
}
</script>

<style scoped>
.table-link {
  color: #2563eb;
  text-decoration: none;
}
.table-link:hover {
  text-decoration: underline;
}
.text-green-600 {
  color: #16a34a;
}
.text-gray-500 {
  color: #6b7280;
}
</style>
