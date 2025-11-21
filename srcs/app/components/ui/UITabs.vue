<template>
  <div :class="['w-full', sticky ? 'sticky top-0 z-30 bg-white' : '']">
    <div
      ref="tablist"
      role="tablist"
      aria-label="ページ内タブ"
      class="relative flex flex-wrap gap-1 border-b border-gray-200 bg-white px-2"
      @keydown="onKeydown"
    >
      <button
        v-for="(t, i) in tabs"
        :key="t.value"
        role="tab"
        :aria-selected="modelValue === t.value"
        :tabindex="modelValue === t.value ? 0 : -1"
        @click="select(t.value, i)"
        @focus="focusIndex = i"
        class="relative rounded-lg px-3 py-2 text-sm font-medium text-gray-700 outline-none transition hover:bg-gray-100"
        :class="modelValue === t.value ? 'text-blue-600' : ''"
      >
        <span>{{ t.label }}</span>
      </button>

      <!-- インジケータ -->
      <span
        class="pointer-events-none absolute bottom-0 h-[2px] rounded-full bg-blue-500 transition-[left,width] duration-300 ease-out"
        :style="indicatorStyle"
        aria-hidden="true"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue";

export interface TabItem {
  label: string;
  value: string;
}

const props = withDefaults(
  defineProps<{
    tabs: TabItem[];
    modelValue: string;
    sticky?: boolean;
  }>(),
  { sticky: true }
);

const emit = defineEmits<{
  (e: "update:modelValue", v: string): void;
  (e: "change", v: string): void;
}>();

const tablist = ref<HTMLElement | null>(null);
const focusIndex = ref(0);
const indicator = ref({ left: 0, width: 0 });

function updateIndicator() {
  nextTick(() => {
    const idx = props.tabs.findIndex((t) => t.value === props.modelValue);
    const btn =
      tablist.value?.querySelectorAll<HTMLButtonElement>("button")[idx];
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const parentLeft = tablist.value!.getBoundingClientRect().left;
    indicator.value = { left: rect.left - parentLeft, width: rect.width };
  });
}

function select(v: string, i: number) {
  emit("update:modelValue", v);
  emit("change", v);
  focusIndex.value = i;
  updateIndicator();
}

function onKeydown(e: KeyboardEvent) {
  const max = props.tabs.length - 1;
  if (["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key))
    e.preventDefault();

  if (e.key === "ArrowRight")
    focusIndex.value = focusIndex.value >= max ? 0 : focusIndex.value + 1;
  if (e.key === "ArrowLeft")
    focusIndex.value = focusIndex.value <= 0 ? max : focusIndex.value - 1;
  if (e.key === "Home") focusIndex.value = 0;
  if (e.key === "End") focusIndex.value = max;

  if (["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) {
    const el =
      tablist.value?.querySelectorAll<HTMLButtonElement>("button")[
        focusIndex.value
      ];
    el?.focus();
  }
}

watch(() => props.modelValue, updateIndicator);

onMounted(() => {
  updateIndicator();
  window.addEventListener("resize", updateIndicator);
});

const indicatorStyle = computed(() => ({
  left: indicator.value.left + "px",
  width: indicator.value.width + "px",
}));
</script>

<style scoped></style>
