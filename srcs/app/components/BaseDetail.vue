<template>
  <div
    class="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
  >
    <h3 v-if="title" class="mb-3 text-lg font-semibold">{{ title }}</h3>
    <dl class="divide-y divide-neutral-200 text-sm dark:divide-neutral-800">
      <div
        v-for="(row, i) in items"
        :key="i"
        class="flex items-center justify-between py-2"
      >
        <dt class="text-neutral-500">{{ row.label }}</dt>
        <dd class="text-neutral-900 dark:text-neutral-100">
          <slot :name="`value-` + i" :row="row">
            {{ row.value }}
          </slot>
        </dd>
      </div>
    </dl>
  </div>
</template>

<script setup lang="ts">
interface Row {
  label: string;
  value?: string | number;
}

defineProps<{ title?: string; items: Row[] }>();
</script>
