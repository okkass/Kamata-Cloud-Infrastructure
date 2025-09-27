<script setup lang="ts">
import { ref, computed } from "vue";
import { useSidebar } from "~/composables/useSidebar";
import {
  userSidebarSections,
  adminSidebarSections,
} from "~/composables/menuItems";

// --- Props ---
const props = defineProps({
  isAdmin: {
    type: Boolean,
    required: true,
  },
});

// --- Composables ---
const { isSidebarOpen, toggleSidebar } = useSidebar();

// --- Data ---
const sidebarSections = computed(() => {
  return props.isAdmin ? adminSidebarSections : userSidebarSections;
});

const sidebarTitle = computed(() => {
  return props.isAdmin ? "管理者メニュー" : "利用者メニュー";
});

// --- State ---
const openSections = ref<string[]>([]);

// --- Methods ---
function toggleSection(title: string) {
  const index = openSections.value.indexOf(title);
  if (index === -1) {
    openSections.value.push(title);
  } else {
    openSections.value.splice(index, 1);
  }
}

function isSectionOpen(title: string) {
  return openSections.value.includes(title);
}
</script>

<template>
  <Transition
    enter-active-class="transition-transform duration-650 ease-out"
    enter-from-class="-translate-x-full"
    enter-to-class="translate-x-0"
    leave-active-class="transition-transform duration-200 ease-in"
    leave-from-class="translate-x-0"
    leave-to-class="-translate-x-full"
  >
    <div
      v-if="isSidebarOpen"
      class="fixed top-0 left-0 bottom-0 w-64 bg-slate-800 text-white p-5 overflow-y-auto"
    >
      <div
        class="flex justify-between items-center text-lg font-bold bg-slate-900 p-3 rounded-md mb-6"
      >
        <span>{{ sidebarTitle }}</span>
        <button
          @click="toggleSidebar"
          class="p-1 rounded-full hover:bg-slate-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>

      <div
        v-for="section in sidebarSections"
        :key="section.title"
        class="mb-2 border-b border-slate-700 last:border-b-0"
      >
        <div
          @click="toggleSection(section.title)"
          class="flex justify-between items-center p-3 bg-slate-700 rounded-md cursor-pointer hover:bg-slate-600 transition-colors"
        >
          <span class="font-semibold text-sm">{{ section.title }}</span>
          <span
            class="transform transition-transform duration-100"
            :class="{ 'rotate-180': isSectionOpen(section.title) }"
            >▼</span
          >
        </div>

        <Transition
          enter-active-class="transition-all duration-50 ease-out"
          enter-from-class="transform -translate-y-2 opacity-0 max-h-0"
          enter-to-class="transform translate-y-0 opacity-100 max-h-screen"
          leave-active-class="transition-all duration-50 ease-in"
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
              class="block text-sm pl-6 py-2 rounded-md hover:bg-slate-700 transition-colors"
            >
              {{ link.text }}
            </NuxtLink>
          </div>
        </Transition>
      </div>
    </div>
  </Transition>
</template>
