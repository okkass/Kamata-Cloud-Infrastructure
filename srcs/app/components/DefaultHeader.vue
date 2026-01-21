<template>
  <header
    class="fixed top-0 w-full bg-white text-sm text-gray-700 z-40 px-4 border-b border-gray-200"
  >
    <div class="flex items-center justify-between h-16">
      <div class="flex items-center">
        <button
          @click="goHome"
          class="text-lg font-bold flex items-center hover:opacity-80 transition-opacity"
        >
          <Icon name="images:logo" size="3em" />
          <span class="ml-2">Kamata-Cloud-Infrastructure</span>
        </button>
      </div>

      <nav>
        <ul class="flex space-x-4">
          <li>
            <nuxt-link to="/settings" class="hover:underline">
              Settings
            </nuxt-link>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>
<script setup lang="ts">
const goHome = () => {
  if (process.client) {
    window.location.href = "/";
  }
};
</script>
