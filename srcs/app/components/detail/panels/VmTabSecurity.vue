<template>
  <section class="space-y-4">
    <h2 class="text-lg font-semibold">セキュリティグループ</h2>

    <!-- ★ 外枠カードのみ（レイアウトは元のまま） -->
    <div class="rounded-lg border border-neutral-200 bg-white p-4 space-y-4">
      
      <div v-if="groups.length > 0" class="space-y-6">
        <div v-for="g in groups" :key="g.id" class="space-y-3">

          <div>
            <div class="text-xs text-neutral-500">ID</div>
            <div class="text-sm text-neutral-900 font-medium">
              {{ g.id }}
            </div>
          </div>

          <div>
            <div class="text-xs text-neutral-500">名前</div>
            <div class="text-sm text-neutral-900 font-medium">
              {{ g.name }}
            </div>
          </div>

          <div>
            <div class="text-xs text-neutral-500">作成日時</div>
            <div class="text-sm text-neutral-900 font-medium">
              {{ g.createdAt ? formatDateTime(g.createdAt) : "—" }}
              <!-- ★ formatDateTime を使って date-time を共通フォーマットに -->
            </div>
          </div>

          <hr v-if="groups.length > 1" class="border-neutral-200 pt-2" />

        </div>
      </div>

      <p v-else class="text-sm text-neutral-500">
        セキュリティグループは登録されていません。
      </p>

    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { formatDateTime } from "~/utils/date"; // ★ 既存の日付ユーティリティを使用
import type { components } from "~~/shared/types";

// ★ DTO 自作禁止 → OpenAPI 生成の VirtualMachineResponse を使う
type VirtualMachineResponse =
  components["schemas"]["VirtualMachineResponse"];

// ★ context は VirtualMachineResponse そのものを受ける
const props = defineProps<{
  context?: VirtualMachineResponse | null;
}>();

// ★ securityGroups はレスポンスをそのまま使いつつ undefined ガードだけ
const groups = computed(() => props.context?.securityGroups ?? []);
</script>
