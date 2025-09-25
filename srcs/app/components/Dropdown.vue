<template>
  <div class="dropdown-root relative inline-block z-10" @keydown.escape="open=false">
    <button
      type="button"
      class="dropdown-trigger bg-slate-600 hover:bg-slate-700 text-white text-sm px-4 py-2 rounded-md shadow-sm flex items-center gap-1"
      @click.stop="toggle"
    >
      <slot>操作</slot>
      <span :class="['transition-transform', open ? 'rotate-180' : '']">▼</span>
    </button>

    <div
      v-if="open"
      class="absolute right-0 mt-1 min-w-32 bg-white border border-gray-300 rounded-md shadow-lg z-50 text-sm overflow-hidden"
      role="menu"
      @click.stop
    >
      <template v-if="!$slots.menu">
        <button class="w-full text-left px-4 py-2 hover:bg-gray-100" @click="emit('edit')" role="menuitem">
          編集
        </button>
        <button class="w-full text-left px-4 py-2 hover:bg-gray-100 text-amber-700" @click="emit('pause')" role="menuitem">
          一時停止
        </button>
        <div class="h-px bg-gray-200"></div>
        <button class="w-full text-left px-4 py-2 hover:bg-gray-100 text-rose-600" @click="emit('delete')" role="menuitem">
          削除
        </button>
      </template>
      <slot name="menu" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
const open = ref(false)
function toggle() { open.value = !open.value }
function onDocClick() { open.value = false }
onMounted(() => document.addEventListener('click', onDocClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))

const emit = defineEmits<{
  (e:'edit'): void
  (e:'pause'): void
  (e:'delete'): void
}>()
</script>

<style scoped>
/* 親が hover で透明化しても、この要素は常時可視 */
.dropdown-root {
  opacity: 1 !important;
  visibility: visible !important;
  display: inline-block !important;
}
/* 常時表示を強制 */
.dropdown-trigger{
  opacity: 1 !important;
  visibility: visible !important;
  pointer-events: auto !important;
}
</style>

<!-- グローバル上書き（強い規則がある環境でも確実に効かせる） -->
<style>
/* 例: table tr button { opacity:0 } のような規則への対抗 */
table tr button.dropdown-trigger{
  opacity: 1 !important;
  visibility: visible !important;
  pointer-events: auto !important;
}
</style>
