<script setup>
import { ref, computed } from "vue";
// Step 1で作成したファイルからメニューデータをインポートします。
import {
  userSidebarSections,
  adminSidebarSections,
} from "~/composables/menuItems";

// --- Props定義 ---
// 親コンポーネントから'role'を受け取ります。
// required: true はこのpropが必須であることを意味します。
// validatorで受け取る値を'admin'か'user'に限定すると、より安全になります。
const props = defineProps({
  role: {
    type: String,
    required: true,
    validator: (value) => ["admin", "user"].includes(value),
  },
});

// --- データ定義 ---
// props.roleの値に応じて、表示するメニューデータを動的に決定します。
// computedを使うことで、props.roleの変更に自動的に追従します。
const sidebarSections = computed(() => {
  return props.role === "admin" ? adminSidebarSections : userSidebarSections;
});

// サイドバーのタイトルも動的に変更します。
const sidebarTitle = computed(() => {
  return props.role === "admin" ? "管理者メニュー" : "利用者メニュー";
});

// --- 状態管理 --- (これ以降のロジックは変更なし)
const openSections = ref([]);

// --- メソッド（関数） ---
function toggleSection(title) {
  const index = openSections.value.indexOf(title);
  if (index === -1) {
    openSections.value.push(title);
  } else {
    openSections.value.splice(index, 1);
  }
}

function isSectionOpen(title) {
  return openSections.value.includes(title);
}
</script>

<template>
  <div
    class="fixed top-0 left-0 bottom-0 w-64 bg-slate-800 text-white p-5 overflow-y-auto"
  >
    <div class="text-lg font-bold bg-slate-900 p-3 rounded-md mb-6">
      {{ sidebarTitle }}
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
          class="transform transition-transform duration-300"
          :class="{ 'rotate-180': isSectionOpen(section.title) }"
          >▼</span
        >
      </div>

      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="transform -translate-y-2 opacity-0"
        enter-to-class="transform translate-y-0 opacity-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="transform translate-y-0 opacity-100"
        leave-to-class="transform -translate-y-2 opacity-0"
      >
        <div v-if="isSectionOpen(section.title)" class="mt-2 mb-3 space-y-1">
          <a
            v-for="link in section.links"
            :key="link.text"
            :href="link.href"
            class="block text-sm pl-6 py-2 rounded-md hover:bg-slate-700 transition-colors"
          >
            {{ link.text }}
          </a>
        </div>
      </Transition>
    </div>
  </div>
</template>
