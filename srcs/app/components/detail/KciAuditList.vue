<template>
  <ul class="kci-audit">
    <li v-for="(a,i) in items" :key="i">
      <div class="kci-audit__time">{{ a.timestamp }}</div>
      <div class="kci-audit__main">
        <strong>{{ a.action }}</strong>
        <span v-if="a.user" class="kci-audit__user">by {{ a.user }}</span>
        <p v-if="a.details" class="kci-audit__details">{{ a.details }}</p>
      </div>
    </li>
  </ul>
</template>
<script setup lang="ts">
export interface AuditItem { timestamp:string; user?:string; action:string; details?:string }
const props = defineProps<{ items: AuditItem[] }>()
</script>
<style scoped>
.kci-audit{ list-style:none; padding:0; margin:0; }
.kci-audit>li{ display:grid; grid-template-columns: 180px 1fr; gap:1rem; padding: .75rem 1rem; border-bottom:1px dashed var(--kci-border); }
.kci-audit__time{ color:var(--kci-muted); }
.kci-audit__user{ color:var(--kci-muted); margin-left:.5rem; font-weight:400; }
.kci-audit__details{ margin:.25rem 0 0; color:var(--kci-text); opacity:.9; }
@media (max-width: 640px){ .kci-audit>li{ grid-template-columns:1fr; } }
</style>
