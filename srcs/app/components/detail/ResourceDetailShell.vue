<template>
  <main class="mx-auto max-w-6xl px-4 py-6">
    <!-- ヘッダー -->
    <header class="mb-4">
      <div
        class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
      >
        <!-- 左側：戻る＋タイトル -->
        <div class="flex items-start gap-3">
          <!-- 戻る（ボタンっぽく囲わない） -->
          <button
            type="button"
            class="mt-1 inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800"
            @click="onBack"
          >
            <span class="text-base"><</span>
            <span>戻る</span>
          </button>

          <div>
            <h1 class="text-2xl font-semibold">
              {{ title }}
            </h1>
            <p v-if="subtitle" class="text-sm text-neutral-500">
              {{ subtitle }}
            </p>
          </div>
        </div>

        <!-- 右側：操作ボタン（中身は actions プロップで差し替え） -->
        <div class="flex items-center gap-2">
          <slot name="operations">
            <!-- 何も渡されていないときのデフォルトのダミーメニュー -->
            <div class="relative z-40" @keydown.esc="isMenuOpen = false">
              <button
                type="button"
                class="inline-flex items-center gap-1 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 shadow-sm hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                @click="toggleMenu"
              >
                操作
                <svg
                  class="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fill-rule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.937a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>

              <!-- ドロップダウンメニュー -->
              <div
                v-if="isMenuOpen"
                class="absolute right-0 mt-1 w-44 rounded-md border border-neutral-200 bg-white py-1 text-sm shadow-lg z-50"
              >
                <button
                  v-for="action in displayActions"
                  :key="action.value"
                  type="button"
                  class="block w-full px-3 py-1.5 text-left text-neutral-700 hover:bg-neutral-100"
                  @click="onAction(action)"
                >
                  {{ action.label }}
                </button>
              </div>
            </div>
          </slot>
        </div>
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

type Action = {
  label: string;
  value: string;
};

const props = defineProps<{
  title: string;
  subtitle?: string;
  // 全タブ共通で使いたいデータ（ダミーでもOK）
  context?: Record<string, any>;
  // 🔹 ページごとに渡せる操作ボタンの中身
  actions?: Action[];
}>();

const emit = defineEmits<{
  (e: "back"): void;
  (e: "action", action: Action): void;
}>();

// 戻るボタン → 親（pages側）に任せる
const onBack = () => {
  emit("back");
};

// デフォルトのダミーアクション（何も渡されなかったとき用）
const defaultActions: Action[] = [
  { label: "ダミーアクション1", value: "dummy1" },
  { label: "ダミーアクション2", value: "dummy2" },
];

// ページから渡された actions があればそれを使う
const displayActions = computed<Action[]>(() => {
  return props.actions && props.actions.length > 0
    ? props.actions
    : defaultActions;
});

// 操作メニューの開閉
const isMenuOpen = ref(false);
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};
const onAction = (action: Action) => {
  emit("action", action);
  isMenuOpen.value = false;
};

// タブの状態管理
const defaultActive =
  Array.isArray(tabs) && tabs.length > 0 ? tabs[0].value : "";
const active = ref<string>(defaultActive);

const tabLabels = computed(() =>
  Array.isArray(tabs)
    ? tabs.map((t) => ({ label: t.label, value: t.value }))
    : []
);

// loader を defineAsyncComponent で扱う（インスタンスごとのキャッシュ）
const componentCache = new Map<string, any>();

const activeComponent = computed(() => {
  if (!Array.isArray(tabs) || tabs.length === 0) return null;
  const tab = tabs.find((t) => t.value === active.value) ?? tabs[0];

  // もし将来 tabs に component プロパティを直書きしたくなった場合用
  if ((tab as any).component) return (tab as any).component;

  if (typeof tab.loader === "function") {
    if (!componentCache.has(tab.value)) {
      componentCache.set(tab.value, defineAsyncComponent(tab.loader));
    }
    return componentCache.get(tab.value);
  }

  return null;
});

// context はそのままタブに渡す
const context = computed(() => props.context ?? {});
</script>
