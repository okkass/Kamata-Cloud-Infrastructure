<!-- src/app/components/detail/ResourceDetailShell.vue -->
<template>
  <main class="mx-auto max-w-6xl px-4 py-6">
    <!-- 戻るリンク（タイトルとは別行） -->
    <div class="mb-2">
      <button
        type="button"
        class="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
      >
        <span class="mr-1">←</span>
        戻る
      </button>
    </div>

    <!-- タイトル ＋ 操作ボタン行 -->
    <header class="mb-4 flex items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold">{{ title }}</h1>
        <p v-if="subtitle" class="mt-1 text-sm text-neutral-500">
          {{ subtitle }}
        </p>
      </div>

      <!-- 操作ボタン＋プルダウン -->
      <div class="relative">
        <button
          type="button"
          class="btn-pulldown"
          @click="isOpsOpen = !isOpsOpen"
        >
          操作
          <span class="ml-1 text-xs" :class="isOpsOpen ? 'rotate-180' : ''">
            ▼
          </span>
        </button>

        <transition name="fade">
          <div
            v-if="isOpsOpen"
            class="absolute right-0 mt-2 w-40 overflow-hidden rounded-2xl border border-gray-200 bg-white text-sm shadow-lg z-50"
          >
            <!-- 中身は後で差し替え前提のダミー -->
            <button
              type="button"
              class="block w-full px-4 py-2 text-left hover:bg-gray-100"
            >
              ダミー操作 1
            </button>
            <button
              type="button"
              class="block w-full px-4 py-2 text-left hover:bg-gray-100"
            >
              ダミー操作 2
            </button>
          </div>
        </transition>
      </div>
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

// 操作ボタン開閉
const isOpsOpen = ref(false);

// 共有コンテキスト（各タブに渡す用：今はダミー想定）
const context = computed(() => props.context ?? {});

// タブの初期値
const defaultActive =
  Array.isArray(tabs) && tabs.length > 0 ? tabs[0].value : "";
const active = ref<string>(defaultActive);

// UITabs 用ラベル配列
const tabLabels = computed(() =>
  Array.isArray(tabs)
    ? tabs.map((t) => ({ label: t.label, value: t.value }))
    : []
);

// loader を defineAsyncComponent で扱う（タブごとにキャッシュ）
const componentCache = new Map<string, any>();

const activeComponent = computed(() => {
  if (!Array.isArray(tabs) || tabs.length === 0) return null;

  const tab = tabs.find((t) => t.value === active.value) ?? tabs[0];

  // 将来 component を直接渡すパターンに対応（現状 tabs には無い）
  // if ((tab as any).component) return (tab as any).component;

  if (typeof tab.loader === "function") {
    if (!componentCache.has(tab.value)) {
      componentCache.set(tab.value, defineAsyncComponent(tab.loader));
    }
    return componentCache.get(tab.value);
  }

  return null;
});
</script>

<style scoped>
main {
  min-height: 70vh;
}

/* プルダウンのフェード用 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
