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
            <!-- ★ 変更: ローカルの formatDate ではなく formatDateTime を使用 -->
            <div class="text-sm text-neutral-900 font-medium">
              {{ formatDateTime(subnet.createdAt) }}
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
// ★ 変更: 日付表示は共通 util の formatDateTime に統一
import { formatDateTime } from "@/utils/date";

// ★ 変更: VirtualNetworkResponse.subnets を元にした画面用のローカル型
//   - id / name / cidr / createdAt だけを持つ
type SubnetView = {
  id: string;
  name: string;
  cidr: string;
  createdAt: string;
};

// ★ 変更: context の型を VirtualNetworkResponse に揃えた形にする
const props = defineProps<{
  context?: {
    subnets?: SubnetView[];
  };
}>();

// ★ 変更: computed でサブネット配列を取り出し（デフォルトは []）
const subnets = computed(() => props.context?.subnets ?? []);
</script>
