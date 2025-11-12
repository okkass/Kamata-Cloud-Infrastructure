<template>
  <ResourceDetailShell
    title="サーバー詳細"
    subtitle="基本情報"
    :context="{ id: 'dummy', region: 'dummy' }"
  />
</template>

<script setup lang="ts">
import ResourceDetailShell from "~/components/detail/ResourceDetailShell.vue";
</script>
