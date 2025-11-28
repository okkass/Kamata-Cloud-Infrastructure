<template>
  <main class="detail-container">
    <header class="detail-header">
      <div class="detail-header-inner">
        <div class="flex items-start gap-3">
          <button
            type="button"
            class="detail-back-button"
            @click="onBack"
            aria-label="戻る"
          >
            <Icon name="heroicons:chevron-left" class="h-6 w-6" />
          </button>

          <div>
            <h1 class="detail-title">
              {{ title }}
            </h1>
            <p v-if="subtitle" class="detail-subtitle">
              {{ subtitle }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <slot name="actions" />

          <div v-if="displayActions.length > 0" class="relative" ref="menuRef">
            <button
              type="button"
              class="detail-menu-button"
              @click="toggleMenu"
            >
              操作
              <Icon
                name="heroicons:chevron-down"
                class="h-4 w-4 text-gray-500"
              />
            </button>

            <div v-if="isMenuOpen" class="detail-menu-dropdown">
              <button
                v-for="action in displayActions"
                :key="action.value"
                type="button"
                class="detail-menu-item"
                @click="onAction(action)"
              >
                {{ action.label }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <div v-if="tabs && tabs.length > 0" class="detail-tabs-wrapper">
      <nav class="detail-tabs-nav" aria-label="Tabs">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          @click="activeTab = tab.value"
          class="detail-tab-button"
          :class="[
            activeTab === tab.value
              ? 'detail-tab-active'
              : 'detail-tab-inactive',
          ]"
          :aria-current="activeTab === tab.value ? 'page' : undefined"
        >
          {{ tab.label }}
        </button>
      </nav>
    </div>

    <div class="min-h-[300px]">
      <RouterView v-if="!activeComponent" />

      <Suspense v-else>
        <KeepAlive>
          <component
            :is="activeComponent"
            :key="activeTab"
            :context="context"
          />
        </KeepAlive>
        <template #fallback>
          <div class="detail-loading">
            <div class="detail-spinner"></div>
          </div>
        </template>
      </Suspense>
    </div>
  </main>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  defineAsyncComponent,
  onMounted,
  onUnmounted,
} from "vue";

// 型定義 (外部ファイルに切り出してもOK)
export type PageAction = {
  label: string;
  value: string;
};

export type TabItem = {
  label: string;
  value: string;
  component?: any; // コンポーネントオブジェクトそのもの
  loader?: () => Promise<any>; // 動的インポート関数
};

// Props
const props = defineProps<{
  title: string;
  subtitle?: string;
  context?: Record<string, any>;
  actions?: PageAction[];
  tabs?: TabItem[]; // ★ tabsをpropで受け取るように変更
}>();

// Emits
const emit = defineEmits<{
  (e: "back"): void;
  (e: "action", action: PageAction): void;
}>();

// --- 戻るボタン ---
const onBack = () => emit("back");

// --- アクションメニュー ---
const isMenuOpen = ref(false);
const menuRef = ref<HTMLElement | null>(null);

const displayActions = computed(() => props.actions ?? []);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const onAction = (action: PageAction) => {
  emit("action", action);
  isMenuOpen.value = false;
};

// メニュー外クリックで閉じる処理
const handleClickOutside = (event: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    isMenuOpen.value = false;
  }
};

onMounted(() => document.addEventListener("click", handleClickOutside));
onUnmounted(() => document.removeEventListener("click", handleClickOutside));

// --- タブ管理 ---
const defaultTab = props.tabs?.[0]?.value ?? "";
const activeTab = ref(defaultTab);

// アクティブなコンポーネントの解決
const activeComponent = computed(() => {
  if (!props.tabs || props.tabs.length === 0) return null;

  const currentTab =
    props.tabs.find((t) => t.value === activeTab.value) ?? props.tabs[0];

  if (currentTab?.component) {
    return currentTab.component;
  }

  if (currentTab?.loader) {
    return defineAsyncComponent(currentTab.loader);
  }

  return null;
});

// コンテキストデータの正規化
const context = computed(() => props.context ?? {});
</script>
