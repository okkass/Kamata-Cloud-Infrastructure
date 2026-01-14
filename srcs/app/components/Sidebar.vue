<script setup lang="ts">
import { ref } from "vue";
import { useSidebar } from "~/composables/useSidebar";
import { useSidebarMenu } from "~/composables/useSidebarMenu";

// --- Composables ---
const { isSidebarOpen, close, open } = useSidebar();
const { getSidebarMenuSections, getSidebarTitle } = useSidebarMenu();

// --- Data ---
const openSections = ref(new Set<string>());

const toggleSection = (title: string) => {
  if (openSections.value.has(title)) {
    openSections.value.delete(title);
  } else {
    openSections.value.add(title);
  }
};

const isSectionOpen = (title: string) => {
  return openSections.value.has(title);
};
</script>

<template>
  <aside
    class="fixed top-16 left-0 bottom-0 bg-white text-slate-800 transition-all duration-300 ease-in-out select-none border-r border-gray-200"
    :class="isSidebarOpen ? 'w-64' : 'w-16'"
  >
    <div v-if="!isSidebarOpen" class="flex flex-col items-center h-full">
      <div class="mb-4">
        <button
          @click="open"
          class="p-2 rounded-md hover:bg-gray-100 transition-colors mt-4"
          aria-label="メニューを開く"
        >
          <span><IconMenu /></span>
        </button>
      </div>
    </div>

    <div v-else class="flex flex-col h-full overflow-hidden">
      <div class="p-4 mb-4 flex justify-between items-center whitespace-nowrap">
        <span class="text-lg font-bold">{{ getSidebarTitle }}</span>
        <button
          @click="close"
          class="p-1 rounded-full hover:bg-gray-200"
          aria-label="メニューを閉じる"
        >
          <span><IconCross /></span>
        </button>
      </div>
      <div class="flex-grow overflow-y-auto px-3 whitespace-nowrap">
        <div
          v-for="section in getSidebarMenuSections"
          :key="section.title"
          class="mb-2 border-b border-gray-200 last:border-b-0"
        >
          <div
            @click="toggleSection(section.title)"
            class="flex justify-between items-center p-3 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <span class="font-semibold text-sm">{{ section.title }}</span>
            <span
              class="transform transition-transform duration-100"
              :class="{ 'rotate-180': isSectionOpen(section.title) }"
              >▼</span
            >
          </div>
          <Transition
            enter-active-class="transition-all duration-100 ease-out"
            enter-from-class="transform -translate-y-2 opacity-0 max-h-0"
            enter-to-class="transform translate-y-0 opacity-100 max-h-screen"
            leave-active-class="transition-all duration-100 ease-in"
            leave-from-class="transform translate-y-0 opacity-100 max-h-screen"
            leave-to-class="transform -translate-y-2 opacity-0 max-h-0"
          >
            <div
              v-if="isSectionOpen(section.title)"
              class="mt-2 mb-3 space-y-1 overflow-hidden"
            >
              <NuxtLink
                v-for="link in section.links"
                :key="link.text"
                :to="link.href"
                class="block text-sm pl-6 py-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                {{ link.text }}
              </NuxtLink>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </aside>
</template>
