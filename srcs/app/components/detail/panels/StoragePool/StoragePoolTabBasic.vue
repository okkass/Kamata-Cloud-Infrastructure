<template>
  <section class="space-y-4">
    <h2 class="text-lg font-semibold">基本情報</h2>

    <div class="detail-card">
      <div>
        <div class="detail-label">名前</div>
        <div class="detail-value">{{ pool?.name || "-" }}</div>
      </div>

      <div>
        <div class="detail-label">作成日時</div>
        <div class="detail-value">{{ formatDateTime(pool?.createdAt) }}</div>
      </div>

      <div>
        <div class="detail-label">総容量</div>
        <div class="detail-value">{{ toSize(pool?.totalSize) }}</div>
      </div>

      <div>
        <div class="detail-label">使用済み</div>
        <div class="detail-value">{{ toSize(pool?.usedSize) }}</div>
      </div>

      <div class="detail-card-section">
        <div class="detail-label mb-1">ネットワークアクセス</div>
        <span
          class="detail-pill"
          :class="pool?.hasNetworkAccess ? 'detail-pill-yes' : 'detail-pill-no'"
        >
          {{ pool?.hasNetworkAccess ? "Yes" : "No" }}
        </span>
      </div>

      <div class="detail-card-section">
        <div class="detail-label mb-1">使用率</div>
        <span class="detail-value">{{ utilizationText }}</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { toSize } from "~/utils/format";

const props = defineProps<{
  context?: StoragePoolResponse | null;
}>();

const pool = computed(() => props.context);

const utilizationText = computed(() => {
  const total = pool.value?.totalSize;
  const used = pool.value?.usedSize;

  if (
    total === undefined ||
    used === undefined ||
    total === 0 ||
    !Number.isFinite(total) ||
    !Number.isFinite(used)
  ) {
    return "—";
  }

  const ratio = Math.min(Math.max(used / total, 0), 1);
  return `${(ratio * 100).toFixed(1)}%（${toSize(used)} / ${toSize(total)}）`;
});
</script>
