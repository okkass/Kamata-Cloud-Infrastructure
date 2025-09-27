<template>
  <div>
    <div v-if="pending">Loading...</div>
    <div v-if="error">Error: {{ error.message }}</div>
    <div v-if="data">
      <pre>{{ data }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";

const route = useRoute();
const { data, pending, error } = await useResourceDetail<ModelInstanceTypeDTO>(
  "security-groups",
  route.params.id as string
);
</script>
