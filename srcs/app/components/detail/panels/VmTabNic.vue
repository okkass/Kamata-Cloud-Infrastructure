<template>
  <section class="p-4">
    <h2 class="text-lg font-medium mb-2">ネットワークインターフェース</h2>
    <ul class="list-disc list-inside text-sm">
      <li v-for="n in context.nics || []" :key="n.id">
        {{ n.name }} - {{ n.ip }}
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{ context: any }>();
const context = props.context ?? {};
</script>
