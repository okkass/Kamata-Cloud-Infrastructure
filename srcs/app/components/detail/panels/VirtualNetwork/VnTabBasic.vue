<template>
  <section class="space-y-4">
    <h2 class="text-lg font-semibold">基本情報</h2>

    <div class="detail-card">
      <div>
        <div class="detail-label">名前</div>
        <div class="detail-value">
          {{ vnet.name || "—" }}
        </div>
      </div>

      <div class="detail-card-section">
        <div class="detail-label">CIDR</div>
        <div class="detail-value font-mono">
          {{ vnet.cidr || "—" }}
        </div>
      </div>

      <div class="detail-card-section">
        <div class="detail-label">作成日時</div>
        <div class="detail-value">
          {{ formatDateTime(vnet.createdAt) }}
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { formatDateTime } from "@/utils/date";

const props = defineProps<{
  context: VirtualNetworkResponse;
}>();

const vnet = computed(() => props.context);
</script>
