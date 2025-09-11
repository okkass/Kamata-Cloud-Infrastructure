<template>
  <div class="kci-tabs" role="tablist">
    <button v-for="t in tabs" :key="t.value" class="kci-tab" :class="{ 'is-active': modelValue === t.value }" role="tab" :aria-selected="modelValue === t.value" @click="$emit('update:modelValue', t.value)">
      {{ t.label }}
    </button>
  </div>
</template>
<script setup lang="ts">
export type KciTab = { label:string; value:string }
const props = defineProps<{ tabs?: KciTab[]; modelValue?: string }>()
const emit = defineEmits(['update:modelValue'])
</script>
<style scoped>
.kci-tabs{ display:flex; gap:.5rem; padding:0 1.25rem 1rem; }
.kci-tab{ background:transparent; color:var(--kci-muted); border:1px solid var(--kci-border); padding:.45rem .8rem; border-radius:999px; cursor:pointer; }
.kci-tab.is-active{ color:var(--kci-text); background:rgba(255,255,255,.06); border-color:var(--kci-accent); }
</style>
