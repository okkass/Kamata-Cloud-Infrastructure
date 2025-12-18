<template>
  <div class="mx-auto max-w-6xl px-4 py-6">
    <div v-if="pending" class="text-sm text-neutral-500">読み込み中…</div>

    <div v-else-if="error" class="text-sm text-red-500">
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
} = await useResourceDetail<NodeResponse>(
  NODE.name,
  route.params.id as string
);

const goBack = () => {
  router.back();
};
</script>
