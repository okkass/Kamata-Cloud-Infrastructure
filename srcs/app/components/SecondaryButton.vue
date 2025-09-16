<template>
  <button
    @click="$emit('click')"
    type="button"
    class="py-2 px-5 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed leading-none"
  >
    <slot>ボタン</slot>
  </button>
</template>

<script setup>
defineEmits(["click"]);
</script>
