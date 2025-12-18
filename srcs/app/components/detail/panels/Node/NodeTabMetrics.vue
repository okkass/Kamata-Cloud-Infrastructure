<template>
  <section class="space-y-4">
    <h2 class="text-lg font-semibold">リソース使用率</h2>

    <div class="detail-card space-y-3">
      <div>
        <div class="detail-label">CPU使用率</div>
        <div class="detail-value">
          {{ formatAsPercent(node?.cpuUtilization) }}
        </div>
      </div>

      <div>
        <div class="detail-label">メモリ使用率</div>
        <div class="detail-value">
          {{ formatAsPercent(node?.memoryUtilization) }}
        </div>
      </div>

      <div>
        <div class="detail-label">ストレージ使用率</div>
        <div class="detail-value">
          {{ formatAsPercent(node?.storageUtilization) }}
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  context?: NodeResponse | null;
}>();

const node = computed(() => props.context);
</script>
