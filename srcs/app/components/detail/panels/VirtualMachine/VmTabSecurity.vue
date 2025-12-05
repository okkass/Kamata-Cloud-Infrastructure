<template>
  <section class="space-y-4">
    <h2 class="text-lg font-semibold">セキュリティグループ</h2>

    <div class="detail-card">
      <div v-if="groups.length > 0" class="space-y-2">
        <article
          v-for="g in groups"
          :key="g.id"
          class="rounded-lg border border-neutral-200 px-4 py-3"
        >
          <div class="mb-2">
            <div class="detail-value">
              {{ g.name }}
            </div>
          </div>

          <dl class="grid gap-2 grid-cols-2">
            <div>
              <dt class="detail-label">ID</dt>
              <dd class="detail-value text-xs font-mono text-neutral-600">
                {{ g.id }}
              </dd>
            </div>

            <div>
              <dt class="detail-label">作成日時</dt>
              <dd class="detail-value text-xs text-right">
                {{ formatDateTime(g.createdAt) }}
              </dd>
            </div>
          </dl>
        </article>
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
</script>
