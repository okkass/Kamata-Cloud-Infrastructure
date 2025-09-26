<template>
  <BaseModal :show="show" @close="$emit('close')">
    <div class="p-4">
      <div class="flex space-y-4 flex-col"></div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  securityGroupData: {
    type: Object as () => SecurityGroupDTO | null,
    default: null,
  },
});
</script>