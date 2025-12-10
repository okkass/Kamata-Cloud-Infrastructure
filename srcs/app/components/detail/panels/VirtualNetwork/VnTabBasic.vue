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
        <!-- ★ 変更: 生の createdAt ではなく formatDateTime() を使う -->
        <div class="text-sm text-neutral-900 font-medium">
          {{ formatDateTime(vnet.createdAt) }}
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
// ★ 変更: 独自の formatDate ではなく、既存の formatDateTime を利用
import { formatDateTime } from "@/utils/date";

// ★ 変更: VirtualNetworkResponse を元にした「画面用のローカル型」
//   - DTO/Response 型は import せず、このファイル内だけで完結させる想定
type VirtualNetworkView = {
  id: string;
  name: string;
  cidr: string;
  createdAt: string;
};

// ★ 変更: context:any ではなく VirtualNetworkView を受け取るようにした
const props = defineProps<{
  context: VirtualNetworkView;
}>();

// ★ 変更: vnet を computed でラップ（以前は props.context ?? {} だったはず）
const vnet = computed(() => props.context);
</script>
