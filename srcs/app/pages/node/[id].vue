<template>
  <div class="mx-auto max-w-6xl px-4 py-6">
    <!-- 初回ロードだけ表示 -->
    <div v-if="!node && pending" class="text-sm text-neutral-500">
      読み込み中…
    </div>

    <div v-else-if="!node && error" class="text-sm text-red-500">
      エラーが発生しました：{{ error.message }}
    </div>

    <ResourceDetailShell
      v-else
      title="物理ノード詳細"
      subtitle="Node Information"
      :tabs="nodeTabs"
      :context="node!"
      @back="goBack"
    />
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { NODE } from "~/utils/constants";

import ResourceDetailShell from "~/components/detail/ResourceDetailShell.vue";
import { nodeTabs } from "~/composables/detail/useNodeTabs";
import { useResourceDetail } from "~/composables/useResourceDetail";

const route = useRoute();
const router = useRouter();

const {
  data: node,
  pending,
  error,
  refresh,
} = await useResourceDetail<NodeResponse>(
  NODE.name,
  route.params.id as string
);


// --- ポーリング設定 ---
const polling = createPolling(async () => {
  await refresh();
});

// lifecycle
onMounted(() => {
  polling.startPolling();
});

onUnmounted(() => {
  polling.stopPolling();
});

const goBack = () => {
  router.back();
};
</script>
