<template>
  <aside class="summary-progress-card h-full flex flex-col">
    <h2 class="summary-section-title flex-shrink-0">クイックリンク</h2>

    <nav class="flex-grow overflow-y-auto mt-4 space-y-2">
      <NuxtLink
        v-for="link in visibleLinks"
        :key="link.to"
        :to="link.to"
        class="quick-link"
      >
        {{ link.text }}
      </NuxtLink>
    </nav>
  </aside>
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * クイックリンク コンポーネント (Summary/QuickLink.vue)
 * ---------------------------------------------------------------------------------
 * ユーザーのロール(isAdmin)に基づき、適切なナビゲーションリンクの一覧を表示します。
 * =================================================================================
 */
import { computed } from "vue";

/**
 * ==================================================================
 * Props
 * ==================================================================
 */
const props = defineProps<{
  /**
   * ユーザーが管理者かどうか。
   * これに基づいて表示するリンクを切り替える。
   */
  isAdmin: boolean;
}>();

/**
 * ==================================================================
 * リンクの定義
 * ==================================================================
 */
// 管理者用のリンク一覧
const adminLinks = [
  { to: "/machine", text: "VM管理" },
  { to: "/physical-node", text: "ノード管理" },
  { to: "/storage-pool", text: "ストレージ" },
  { to: "/security-group", text: "セキュリティ" },
  { to: "/user", text: "ユーザー管理" },
  { to: "/settings", text: "アカウント設定" },
];

// 一般ユーザー用のリンク一覧
const userLinks = [
  { to: "/machine", text: "VM管理" },
  { to: "/security-group", text: "セキュリティ" },
  { to: "/settings", text: "アカウント設定" },
];

/**
 * ==================================================================
 * Computed
 * ------------------------------------------------------------------
 * props.isAdmin の値に基づいて、表示すべきリンクの配列を返す。
 * ==================================================================
 */
const visibleLinks = computed(() => {
  return props.isAdmin ? adminLinks : userLinks;
});
</script>
