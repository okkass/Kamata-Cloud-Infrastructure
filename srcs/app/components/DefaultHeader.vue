<template>
  <header
    class="fixed top-0 w-full bg-white text-sm text-gray-700 z-40 shadow-md px-4"
  >
    <div class="flex items-center justify-between h-16">
      <div class="flex items-center">
        <nuxt-link to="/" class="text-lg font-bold flex items-center">
          <Icon name="images:logo" size="5em" class="mt-2" />
          <span class="ml-2">Kamata-Cloud-Infrastrucuture</span>
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
