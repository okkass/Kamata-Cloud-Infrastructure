<template>
  <div class="kci-grid" role="list">
    <div v-for="(item,i) in items" :key="i" class="kci-grid__row" role="listitem">
      <div class="kci-grid__key">{{ item.label }}</div>
      <div class="kci-grid__val">
        <slot name="value" :item="item">{{ item.value }}</slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export type Item = { label: string; value?: unknown }
const props = defineProps<{ items: Item[] }>()
</script>

<style scoped>
.kci-grid{ display:grid; grid-template-columns:1fr; }
.kci-grid__row{ display:grid; grid-template-columns: 200px 1fr; gap:.75rem; padding:.75rem 1rem; border-bottom:1px dashed var(--kci-border); }
.kci-grid__row:last-child{ border-bottom:none; }
.kci-grid__key{ color:var(--kci-muted); }
.kci-grid__val{ color:var(--kci-text); word-break:break-word; }
@media (max-width: 640px){ .kci-grid__row{ grid-template-columns:1fr; } }
</style>
