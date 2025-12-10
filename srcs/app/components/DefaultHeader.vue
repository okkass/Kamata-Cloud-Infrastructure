<template>
  <header class="fixed top-0 w-full bg-white text-sm text-gray-700 z-40 px-4 border-b border-gray-200">
    <div class="flex items-center justify-between h-16">
      <div class="flex items-center">
        <nuxt-link to="/" class="text-lg font-bold flex items-center">
          <Icon name="images:logo" size="3em" />
          <span class="ml-2">Kamata-Cloud-Infrastructure</span>
        </nuxt-link>
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
