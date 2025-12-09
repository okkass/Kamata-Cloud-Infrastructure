<template>
  <section class="space-y-4">
    <h2 class="text-lg font-semibold">基本情報</h2>

    <div class="rounded-lg border border-neutral-200 bg-white p-4 space-y-3">
      
      <div>
        <div class="text-xs text-neutral-500">名前</div>
        <div class="text-sm text-neutral-900 font-medium">
          {{ vnet.name || "—" }}
        </div>
      </div>

      <div>
        <div class="text-xs text-neutral-500">CIDR</div>
        <div class="text-sm text-neutral-900 font-medium font-mono">
          {{ vnet.cidr || "—" }}
        </div>
      </div>

      <div>
        <div class="text-xs text-neutral-500">作成日時</div>
        <div class="text-sm text-neutral-900 font-medium">
          {{ formatDateTime(vnet.createdAt) }}
        </div>
      </div>

      <div v-if="vnet.description" class="pt-3 border-t border-neutral-200">
        <div class="text-xs text-neutral-500 mb-1">説明</div>
        <div class="text-sm text-neutral-900">
          {{ vnet.description }}
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { formatDateTime } from "@/utils/date";

const props = defineProps<{
  context: any;
}>();

const vnet = computed(() => props.context ?? {});
</script>
