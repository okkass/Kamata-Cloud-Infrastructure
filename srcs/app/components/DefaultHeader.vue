<template>
  <header class="bg-white text-sm text-gray-700 relative z-50 shadow-md px-4">
    <div class="flex items-center justify-between h-16">
      <div class="flex items-center">
        <nuxt-link to="/" class="text-lg font-bold">KCI</nuxt-link>
      </div>

      <nav>
        <ul class="flex space-x-4">
          <li>
            <nuxt-link to="/settings" class="hover:underline">Settings</nuxt-link>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>
