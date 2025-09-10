<template>
  <div class="kci-actions">
    <button v-for="a in actions" :key="a.id" class="kci-btn" :class="'kci-btn--'+(a.kind||'secondary')" :disabled="a.disabled" @click="$emit('click', a.id)">
      {{ a.label }}
    </button>
  </div>
</template>
<script setup lang="ts">
export type ActionItem = { id:string; label:string; kind?:'primary'|'secondary'|'danger'|'ghost'; disabled?:boolean }
const props = defineProps<{ actions?: ActionItem[] }>()
</script>
<style scoped>
.kci-actions{ display:flex; gap:.5rem; flex-wrap:wrap; }
.kci-btn{ appearance:none; border:1px solid var(--kci-border); background:rgba(255,255,255,.02); color:var(--kci-text); padding:.5rem .8rem; border-radius:10px; cursor:pointer; font-weight:600; }
.kci-btn:hover{ background:rgba(255,255,255,.06); }
.kci-btn:disabled{ opacity:.6; cursor:not-allowed; }
.kci-btn--primary{ background: var(--kci-accent); border-color: transparent; }
.kci-btn--danger{ background: var(--kci-danger); border-color: transparent; }
.kci-btn--ghost{ background: transparent; }
</style>
