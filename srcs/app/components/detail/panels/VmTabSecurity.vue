<!-- srcs/app/components/detail/panels/VmTabSecurity.vue -->
<template>
  <section class="p-4 space-y-4">
    <h2 class="mb-2 text-lg font-medium">セキュリティグループ</h2>

    <!-- グループがある場合 -->
    <div
      v-for="g in securityGroups"
      :key="g.id"
      class="rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm"
    >
      <dl class="space-y-2">
        <div>
          <dt class="text-xs text-neutral-500">ID</dt>
          <dd class="font-mono break-all text-neutral-900">
            {{ g.id }}
          </dd>
        </div>

        <div>
          <dt class="text-xs text-neutral-500">名前</dt>
          <dd class="text-neutral-900">
            {{ g.name }}
          </dd>
        </div>

        <div>
          <dt class="text-xs text-neutral-500">作成日時</dt>
          <dd class="text-neutral-900">
            {{ formatDate(g.createdAt) }}
          </dd>
        </div>
      </dl>
    </div>

    <!-- グループが 0 件のとき -->
    <p
      v-if="!securityGroups || securityGroups.length === 0"
      class="text-sm text-neutral-500"
    >
      セキュリティグループは登録されていません。
    </p>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  context?: {
    securityGroups?: {
      id: string
      name: string
      createdAt: string
    }[]
  }
}>()

// undefined ガードしておく
const securityGroups = props.context?.securityGroups ?? []

// 日時表示用フォーマッタ
function formatDate(value?: string) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value

  return d.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>
