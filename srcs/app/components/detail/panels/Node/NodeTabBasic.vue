<template>
  <section class="space-y-4">
    <h2 class="text-lg font-semibold">基本情報</h2>

    <div class="detail-card">
      <div>
        <div class="detail-label">名前</div>
        <div class="detail-value">{{ node?.name || "-" }}</div>
      </div>

      <div>
        <div class="detail-label">ノードID</div>
        <div class="detail-value">{{ node?.id || "-" }}</div>
      </div>

      <div>
        <div class="detail-label">IPアドレス</div>
        <div class="detail-value">{{ node?.ipAddress || "-" }}</div>
      </div>

      <div>
        <div class="detail-label">作成日時</div>
        <div class="detail-value">
          {{ formatDateTime(node?.createdAt) }}
        </div>
      </div>

      <div class="detail-card-section">
        <div class="detail-label mb-1">状態</div>
        <span class="detail-pill" :class="nodeStatus.class">
          {{ nodeStatus.text }}
        </span>
      </div>

      <div class="detail-card-section">
        <div class="detail-heading-sm">管理ノード</div>
        <span
          class="detail-pill"
          :class="node?.isAdmin ? 'detail-pill-yes' : 'detail-pill-no'"
        >
          {{ node?.isAdmin ? "Yes" : "No" }}
        </span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { getNodeStatusDisplay } from "~/utils/status";

const props = defineProps<{
  context?: NodeResponse | null;
}>();

const node = computed(() => props.context);

const nodeStatus = computed(() => {
  const raw = node.value?.status ?? "";
  return getNodeStatusDisplay(raw);
});
</script>
