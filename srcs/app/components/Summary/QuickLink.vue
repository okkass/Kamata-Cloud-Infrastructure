<template>
  <aside class="summary-progress-card h-full flex flex-col">
    <h2 class="summary-section-title flex-shrink-0">クイックリンク</h2>

    <nav class="flex-grow overflow-y-auto mt-4 space-y-2">
      <NuxtLink
        v-for="link in getQuickLinks"
        :key="link.href"
        :to="link.href"
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
 * ユーザーの権限に基づき、適切なナビゲーションリンクの一覧を表示します。
 * =================================================================================
 */
import { useQuickLinks } from "~/composables/useQuickLinks";

const { getQuickLinks } = useQuickLinks();
</script>
