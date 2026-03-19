<template>
  <div class="mx-auto max-w-6xl px-4 py-6">
    <!-- 初回ロードだけ表示 -->
    <div v-if="!node && pending" class="text-sm text-neutral-500">
      読み込み中…
    </div>

    <ResourceDetailShell
      v-else-if="node"
      title="物理ノード詳細"
      subtitle="Node Information"
      :tabs="nodeTabs"
      :context="node!"
      @back="goBack"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { NODE } from "~/utils/constants";
import { createPolling } from "~/utils/polling";

import ResourceDetailShell from "~/components/detail/ResourceDetailShell.vue";
import { nodeTabs } from "~/composables/detail/useNodeTabs";
import { useResourceDetail } from "~/composables/useResourceDetail";
import { useResourceErrorGuard } from "~/composables/useResourceErrorGuard";

const route = useRoute();
const router = useRouter();

const {
  data: node,
  pending,
  error,
  refresh,
} = await useResourceDetail<NodeResponse>(NODE.name, route.params.id as string);

// エラーをカスタムエラーページに統一
useResourceErrorGuard(node, pending, error);

// --- ポーリング設定 ---
const polling = createPolling(async () => {
  await refresh();
});

// lifecycle
onMounted(() => {
  void polling.runOnce();
  polling.startPolling();
});

onUnmounted(() => {
  polling.stopPolling();
});

const goBack = () => {
  router.back();
};
</script>
