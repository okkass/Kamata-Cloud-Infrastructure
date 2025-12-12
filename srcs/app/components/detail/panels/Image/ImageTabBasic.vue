<template>
  <section class="space-y-4">
    <h2 class="text-lg font-semibold">基本情報</h2>

    <div class="detail-card">
      <div>
        <div class="detail-label">名前</div>
        <div class="detail-value">
          {{ image?.name || "-" }}
        </div>
      </div>

      <div>
        <div class="detail-label">作成日時</div>
        <div class="detail-value">
          {{ formatDateTime(image?.createdAt) }}
        </div>
      </div>

      <div>
        <div class="detail-label">サイズ</div>
        <div class="detail-value">
          {{ image?.size != null ? toSize(image.size) : "—" }}
        </div>
      </div>

      <div>
        <div class="detail-label">ノード</div>
        <div class="detail-value">
          {{ image?.node.name || "-" }}
        </div>
      </div>

      <div class="detail-card-section">
        <div class="detail-heading-sm">説明</div>
        <div class="detail-value whitespace-pre-wrap">
          {{ image?.description || "-" }}
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  context?: ImageResponse | null;
}>();

const image = computed(() => props.context);
</script>
