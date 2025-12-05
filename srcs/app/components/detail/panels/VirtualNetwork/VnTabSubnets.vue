<template>
  <section class="space-y-4">
    <h2 class="text-lg font-semibold">サブネット</h2>

    <!-- 外枠カード一枚だけ -->
    <div class="rounded-lg border border-neutral-200 bg-white p-4 space-y-4">
      <div v-if="subnets.length > 0" class="space-y-6">
        <div v-for="subnet in subnets" :key="subnet.id" class="space-y-3">
          <div>
            <div class="text-xs text-neutral-500">サブネット名</div>
            <div class="text-sm text-neutral-900 font-medium">
              {{ subnet.name || "—" }}
            </div>
          </div>

          <div>
            <div class="text-xs text-neutral-500">CIDR</div>
            <div class="text-sm text-neutral-900 font-medium font-mono">
              {{ subnet.cidr || "—" }}
            </div>
          </div>

          <div>
            <div class="text-xs text-neutral-500">作成日時</div>
            <div class="text-sm text-neutral-900 font-medium">
              {{ formatDate(subnet.createdAt) }}
            </div>
          </div>

          <!-- 複数サブネットがある場合の区切り線 -->
          <hr v-if="subnets.length > 1" class="border-neutral-200 pt-2" />
        </div>
      </div>

      <p v-else class="text-sm text-neutral-500">
        サブネットは登録されていません。
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  context?: {
    subnets?: {
      id: string;
      name: string;
      cidr: string;
      possibleExternalConnection?: boolean;
      createdAt?: string;
    }[];
  };
}>();

const subnets = computed(() => props.context?.subnets ?? []);

function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;

  return d.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
</script>
