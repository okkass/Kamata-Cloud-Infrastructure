<template>
  <section class="space-y-4">
    <h2 class="text-lg font-semibold">セキュリティグループ</h2>

    <!-- ★ 外枠カードのみ -->
    <div class="rounded-lg border border-neutral-200 bg-white p-4 space-y-4">
      
      <div v-if="groups.length > 0" class="space-y-6">
        <div v-for="g in groups" :key="g.id" class="space-y-3">

          <div>
            <div class="text-xs text-neutral-500">ID</div>
            <div class="text-sm text-neutral-900 font-medium">
              {{ g.id }}
            </div>
          </div>

          <div>
            <div class="text-xs text-neutral-500">名前</div>
            <div class="text-sm text-neutral-900 font-medium">
              {{ g.name }}
            </div>
          </div>

          <div>
            <div class="text-xs text-neutral-500">作成日時</div>
            <div class="text-sm text-neutral-900 font-medium">
              {{ formatDate(g.createdAt) }}
            </div>
          </div>

          <hr v-if="groups.length > 1" class="border-neutral-200 pt-2" />

        </div>
      </div>

      <p v-else class="text-sm text-neutral-500">
        セキュリティグループは登録されていません。
      </p>

    </div>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  context?: {
    securityGroups?: { id: string; name: string; createdAt: string }[];
  };
}>();

const groups = props.context?.securityGroups ?? [];

function formatDate(value?: string) {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
</script>
