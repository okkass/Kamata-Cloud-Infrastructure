<script setup lang="ts" generic="T extends Record<string, any>">
// ✨ generic属性を追加
import { ref, computed, onMounted, onBeforeUnmount, useSlots } from "vue";
import type { PropType } from "vue";

// ==============================================================================
// 型定義 (Type Definitions)
// ==============================================================================
interface Column {
  key: string;
  label: string;
}
interface HeaderButton {
  label: string;
  action: string;
}

// ==============================================================================
// Props & Emits
// ==============================================================================
const props = defineProps({
  title: { type: String, default: "ダッシュボード" },
  columns: { type: Array as PropType<Column[]>, required: true },
  rows: { type: Array as PropType<T[]>, required: true }, // ✨ RowData[] を T[] に変更
  rowKey: { type: String, default: "id" },
  headerButtons: { type: Array as PropType<HeaderButton[]>, default: () => [] },
});

const emit = defineEmits<{
  (e: "header-action", action: string): void;
  (e: "row-action", payload: { action: string; row: T }): void; // ✨ RowData を T に変更
}>();

// ==============================================================================
// リアクティブな状態 (Reactive State)
// ==============================================================================
const openKey = ref<string | number | null>(null);
const menuPos = ref({ top: 0, left: 0 });

// ==============================================================================
// 算出プロパティ (Computed Properties)
// ==============================================================================
const slots = useSlots();
const hasRowActions = computed(() => !!slots["row-actions"]);

// ==============================================================================
// メソッド (Methods)
// ==============================================================================
// ✨ 関数の引数も T に変更
const getKeyForRow = (row: T, index: number): string | number => {
  // `row`がオブジェクトであることを保証するため、型アサーションを追加
  const recordRow = row as Record<string, any>;
  return props.rowKey && recordRow[props.rowKey]
    ? recordRow[props.rowKey]
    : index;
};

const toggleMenu = (event: MouseEvent, row: T, index: number) => {
  const key = getKeyForRow(row, index);
  if (openKey.value === key) {
    openKey.value = null;
    return;
  }
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  menuPos.value = {
    top: rect.bottom + 8,
    left: rect.left + rect.width / 2,
  };
  openKey.value = key;
};

const closeMenu = () => {
  openKey.value = null;
};

const handleOutsideClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (
    !target.closest(".dl-menu-floating") &&
    !target.closest(".menu-trigger")
  ) {
    closeMenu();
  }
};

const handleEscapeKey = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    closeMenu();
  }
};

// ==============================================================================
// ライフサイクルフック (Lifecycle Hooks)
// ==============================================================================
onMounted(() => {
  document.addEventListener("click", handleOutsideClick);
  window.addEventListener("keydown", handleEscapeKey);
  window.addEventListener("scroll", closeMenu, { passive: true });
  window.addEventListener("resize", closeMenu);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleOutsideClick);
  window.removeEventListener("keydown", handleEscapeKey);
  window.removeEventListener("scroll", closeMenu);
  window.removeEventListener("resize", closeMenu);
});
</script>

<template>
  <div class="p-3 text-slate-900 font-sans bg-white">
    <div class="flex items-center justify-between gap-2 flex-wrap mb-4">
      <h1 class="m-0 text-[26px] font-extrabold tracking-[0.02em]">
        {{ title }}
      </h1>
      <div class="flex gap-2">
        <slot name="header-actions">
          <button
            v-for="(btn, i) in headerButtons"
            :key="i"
            class="btn btn-primary"
            @click="emit('header-action', btn.action)"
          >
            {{ btn.label }}
          </button>
        </slot>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table
        class="w-full table-auto border border-slate-200 rounded-lg shadow-md bg-white"
      >
        <thead>
          <tr class="table-header">
            <th
              v-for="c in columns"
              :key="c.key"
              class="table-header-cell text-left"
            >
              {{ c.label }}
            </th>
            <th v-if="hasRowActions" class="table-header-cell text-center">
              操作
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, rIdx) in rows"
            :key="getKeyForRow(row, rIdx)"
            class="table-row"
          >
            <td v-for="c in columns" :key="c.key" class="table-cell">
              <slot :name="`cell-${c.key}`" :row="row">
                {{ row[c.key] }}
              </slot>
            </td>

            <td v-if="hasRowActions" class="table-cell text-center">
              <button
                class="py-1 px-3 text-sm text-[#5b8eb8] hover:bg-slate-100 rounded-full"
                @click.stop="toggleMenu($event, row, rIdx)"
              >
                <IconKebabMenu />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <teleport to="body">
      <div
        v-if="openKey !== null"
        class="dl-menu-floating fixed -translate-x-1/2 bg-white border border-slate-300 shadow-xl rounded-xl min-w-[180px] max-h-[50vh] overflow-y-auto z-[4000]"
        :style="{ top: `${menuPos.top}px`, left: `${menuPos.left}px` }"
        @click.stop
      >
        <slot
          name="row-actions"
          :row="rows.find((r, i) => getKeyForRow(r, i) === openKey)"
          :emit="(action: string) => emit('row-action', { action, row: rows.find((r, i) => getKeyForRow(r, i) === openKey)! })"
        />
      </div>
    </teleport>
  </div>
</template>
