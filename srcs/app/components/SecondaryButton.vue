<template>
  <button
    @click="$emit('click')"
    type="button"
    class="btn btn-back"
  >
    <slot>X</slot>
  </button>
</template>

<script setup>
defineEmits(["click"]);
</script>
