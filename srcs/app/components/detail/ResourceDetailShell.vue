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
            <span class="text-base">&lt;</span>
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

        <!-- 右側：操作ボタン（actions をページから渡せる） -->
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
                class="absolute right-0 mt-1 w-44 rounded-md border border-neutral-200 bg-white py-1 text-sm shadow-lg z-40"
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
import { ref, computed, defineAsyncComponent, type ComputedRef } from "vue";
import UITabs from "~/components/ui/UITabs.vue";

type TabDef = {
  label: string;
  value: string;
  loader?: () => Promise<any>;
  component?: any;
};

type ActionDef = {
  label: string;
  value: string;
};

// props / emits
const props = defineProps<{
  title: string;
  subtitle?: string;
  // 全タブで共有したいデータ（今はダミーでもOK）
  context?: Record<string, any>;
  // タブ定義：ページごとに差し替えたいところ
  tabs: TabDef[];
  // 操作メニュー：ページごとに差し替えたいところ
  actions?: ActionDef[];
}>();

const emit = defineEmits<{
  (e: "back"): void;
  (e: "action", value: string): void;
}>();

// ---- 戻る押されたとき（pages側でURL遷移などをやる） ----
const onBack = () => {
  emit("back");
};

// ---- 操作メニューの項目（props.actions がなければダミー） ----
const fallbackActions: ActionDef[] = [
  { label: "ダミーアクション1", value: "dummy1" },
  { label: "ダミーアクション2", value: "dummy2" },
];

const displayActions: ComputedRef<ActionDef[]> = computed(() =>
  props.actions && props.actions.length > 0 ? props.actions : fallbackActions
);

// ---- 操作メニューの開閉 ----
const isMenuOpen = ref(false);
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};
const onAction = (action: ActionDef) => {
  emit("action", action.value);
  isMenuOpen.value = false;
};

// ---- タブの状態管理 ----
const defaultActive =
  Array.isArray(props.tabs) && props.tabs.length > 0 ? props.tabs[0].value : "";
const active = ref<string>(defaultActive);

const tabLabels = computed(() =>
  Array.isArray(props.tabs)
    ? props.tabs.map((t) => ({ label: t.label, value: t.value }))
    : []
);

// loader を defineAsyncComponent で扱う（インスタンスごとのキャッシュ）
const componentCache = new Map<string, any>();

const activeComponent = computed(() => {
  if (!Array.isArray(props.tabs) || props.tabs.length === 0) return null;
  const tab = props.tabs.find((t) => t.value === active.value) ?? props.tabs[0];

  // もし将来 tabs に component プロパティを直書きしたくなった場合用
  if (tab.component) return tab.component;

  if (typeof tab.loader === "function") {
    if (!componentCache.has(tab.value)) {
      componentCache.set(tab.value, defineAsyncComponent(tab.loader));
    }
    return componentCache.get(tab.value);
  }

  return null;
});

// context はそのままタブに渡すだけ
const context = computed(() => props.context ?? {});
</script>
