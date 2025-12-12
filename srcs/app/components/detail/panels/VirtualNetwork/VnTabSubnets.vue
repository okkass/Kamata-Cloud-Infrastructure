<template>
  <section class="space-y-4">
    <h2 class="text-lg font-semibold">サブネット</h2>

    <!-- 外枠カード一枚 -->
    <div class="detail-card">
      <div v-if="subnets.length > 0" class="space-y-6">
        <div
          v-for="(subnet, index) in subnets"
          :key="subnet.id"
          class="space-y-3"
        >
          <div>
            <div class="detail-label">サブネット名</div>
            <div class="detail-value">
              {{ subnet.name || "—" }}
            </div>
          </div>

          <div>
            <div class="detail-label">CIDR</div>
            <div class="detail-value font-mono">
              {{ subnet.cidr || "—" }}
            </div>
          </div>

          <div>
            <div class="detail-label">作成日時</div>
            <div class="detail-value">
              {{ formatDateTime(subnet.createdAt) }}
            </div>
          </div>

          <!-- サブネット区切り線（最後以外に表示） -->
          <hr
            v-if="subnets.length > 1 && index < subnets.length - 1"
            class="border-neutral-200 pt-2"
          />
        </div>
      </div>

      <!-- データなし -->
      <p v-else class="text-sm text-neutral-500">
        サブネットは登録されていません。
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { formatDateTime } from "@/utils/date";

const props = defineProps<{
  context?: VirtualNetworkResponse;
}>();

const subnets = computed(() => props.context?.subnets ?? []);
</script>
