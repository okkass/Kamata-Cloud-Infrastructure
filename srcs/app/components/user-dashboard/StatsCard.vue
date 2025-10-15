<script setup lang="ts">
defineProps<{
  title: string;
  items: { label: string; value: string | number }[];
}>();
</script>

<template>
  <div class="bg-white rounded-xl shadow p-5">
    <h3 class="text-base font-semibold mb-3">{{ title }}</h3>
    <ul class="space-y-1.5">
      <li
        v-for="(it, i) in items"
        :key="i"
        class="flex justify-between text-sm"
      >
        <span class="text-slate-500">{{ it.label }}</span>
        <span class="font-medium text-slate-800">{{ it.value }}</span>
      </li>
    </ul>
  </div>
</template>
