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
const RESOURCE_NAME = "images";

const route = useRoute();
const { data, pending, error } = useResourceDetail<ImageDTO>(
  RESOURCE_NAME,
  route.params.id as string
);
</script>
