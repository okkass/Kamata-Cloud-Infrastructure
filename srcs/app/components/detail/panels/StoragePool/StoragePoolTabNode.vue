<template>
  <section class="space-y-4">
    <h2 class="text-lg font-semibold">物理ノード</h2>

    <div class="detail-card">
      <div>
        <div class="detail-label">名前</div>
        <div class="detail-value">{{ node?.name || "-" }}</div>
      </div>

      <div>
        <div class="detail-label">IPアドレス</div>
        <div class="detail-value">{{ node?.ipAddress || "-" }}</div>
      </div>

      <div>
        <div class="detail-label">状態</div>
        <span class="detail-pill" :class="nodeStatus.class">
          {{ nodeStatus.text }}
        </span>
      </div>

      <div>
        <div class="detail-label">管理ノード</div>
        <span
          class="detail-pill"
          :class="node?.isAdmin ? 'detail-pill-yes' : 'detail-pill-no'"
        >
          {{ node?.isAdmin ? "Yes" : "No" }}
        </span>
      </div>

      <div>
        <div class="detail-label">作成日時</div>
        <div class="detail-value">{{ formatDateTime(node?.createdAt) }}</div>
      </div>

      <div class="detail-card-section">
        <div class="detail-heading-sm">使用率</div>

        <div class="space-y-1">
          <div>
            <span class="detail-label">CPU：</span>
            <span class="detail-value">{{ formatAsPercent(node?.cpuUtilization) }}</span>
          </div>
          <div>
            <span class="detail-label">メモリ：</span>
            <span class="detail-value">{{ formatAsPercent(node?.memoryUtilization) }}</span>
          </div>
          <div>
            <span class="detail-label">ストレージ：</span>
            <span class="detail-value">{{ formatAsPercent(node?.storageUtilization) }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { getNodeStatusDisplay, formatAsPercent } from "~/utils/status";

const props = defineProps<{
  context?: StoragePoolResponse | null;
}>();

const node = computed(() => props.context?.node);

const nodeStatus = computed(() => {
  const raw = node.value?.status ?? "";
  return getNodeStatusDisplay(raw);
});
</script>
