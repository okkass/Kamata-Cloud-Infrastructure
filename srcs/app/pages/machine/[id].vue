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
const RESOURCE_NAME = "virtual-machines";

const route = useRoute();
const { data, pending, error } = useResourceDetail<VirtualMachineDTO>(
  RESOURCE_NAME,
  route.params.id as string
);
</script>
