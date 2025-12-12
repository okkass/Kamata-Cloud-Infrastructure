<template>
  <section class="space-y-4">
    <h2 class="text-lg font-semibold">基本情報</h2>

    <div class="detail-card">
      <!-- Name -->
      <div>
        <div class="detail-label">名前</div>
        <div class="text-base font-medium text-neutral-900">
          {{ instanceType.name }}
        </div>
      </div>

      <!-- 作成日時 -->
      <div>
        <div class="detail-label">作成日時</div>
        <div class="detail-value">
          {{ formattedCreatedAt }}
        </div>
      </div>

      <!-- スペック -->
      <div class="detail-card-section">
        <div class="detail-heading-sm">スペック</div>

        <div class="detail-grid-2col">
          <div>
            <div class="detail-label">CPU</div>
            <div class="detail-value">
              {{ instanceType.cpuCore }} cores
            </div>
          </div>

          <div>
            <div class="detail-label">メモリ</div>
            <div class="detail-value">
              {{ memoryGB }} GB
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { formatDateTime } from "@/utils/date";
import { convertByteToUnit } from "@/utils/format";

const props = defineProps<{
  context: InstanceTypeResponse;
}>();

const instanceType = props.context;

const formattedCreatedAt = computed(() => formatDateTime(instanceType.createdAt));
const memoryGB = computed(() => convertByteToUnit(instanceType.memorySize, "GB"));
</script>
