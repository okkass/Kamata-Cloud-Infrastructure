<template>
  <main class="mx-auto max-w-6xl px-4 py-6">
    <header class="mb-4">
      <h1 class="text-2xl font-semibold">{{ title }}</h1>
      <p class="text-sm text-neutral-500">{{ subtitle }}</p>
    </header>

    <!-- タブバー -->
    <UITabs v-model="active" :tabs="tabLabels" />

    <!-- タブ中身 -->
    <Suspense>
      <KeepAlive>
        <component
          v-if="activeComponent"
          :is="activeComponent"
          :key="active"
          :context="context"
        />
      </KeepAlive>
      <template #fallback>
        <div class="py-8 text-center text-sm text-neutral-500">読み込み中…</div>
      </template>
    </Suspense>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from "vue";
import UITabs from "~/components/ui/UITabs.vue";
import { tabs } from "~/composables/usetabs";

const props = defineProps<{
  title: string;
  subtitle?: string;
  context?: Record<string, any>;
}>();

// tabs が未定義／空の場合に落ちないようにガード
const defaultActive =
  Array.isArray(tabs) && tabs.length > 0 ? tabs[0].value : "";
const active = ref<string>(defaultActive);

const tabLabels = computed(() =>
  Array.isArray(tabs)
    ? tabs.map((t) => ({ label: t.label, value: t.value }))
    : []
);

// loader を defineAsyncComponent で扱う（キャッシュ）
const componentCache = new Map<string, any>();
const activeComponent = computed(() => {
  if (!Array.isArray(tabs) || tabs.length === 0) return null;
  const tab = tabs.find((t) => t.value === active.value) ?? tabs[0];

  // 既に component プロパティがあればそれを使う
  if (tab.component) return tab.component;

  // loader があれば defineAsyncComponent でラップしてキャッシュ
  if (typeof tab.loader === "function") {
    if (!componentCache.has(tab.value)) {
      componentCache.set(tab.value, defineAsyncComponent(tab.loader));
    }
    return componentCache.get(tab.value);
  }

  return null;
});
</script>
