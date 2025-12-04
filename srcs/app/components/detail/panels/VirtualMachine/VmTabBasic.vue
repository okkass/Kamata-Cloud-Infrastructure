<template>
  <section class="space-y-4">
    <h2 class="text-lg font-semibold">基本情報</h2>

    <!-- 基本情報カード -->
    <div class="rounded-lg border border-neutral-200 bg-white p-4 space-y-3">
      <div>
        <div class="text-xs text-neutral-500">名前</div>
        <div class="text-base font-medium">
          {{ vm.name }}
        </div>
      </div>

      <div>
        <div class="text-xs text-neutral-500">作成日時</div>
        <div class="text-sm text-neutral-900 font-medium">
          {{ vm.createdAt || "-" }}
        </div>
      </div>

      <!-- ノード情報 -->
      <div class="pt-3 border-t border-neutral-200">
        <div class="mb-1 text-xs font-semibold text-neutral-500">
          ノード
        </div>

        <div class="space-y-1">
          <div>
            <span class="text-xs text-neutral-500">名前：</span>
            <span class="text-sm text-neutral-900 font-medium">
              {{ vm.node?.name || "-" }}
            </span>
          </div>
          <div>
            <span class="text-xs text-neutral-500">IPアドレス：</span>
            <span class="text-sm font-medium">
              {{ vm.node?.ipAddress || "-" }}
            </span>
          </div>
          <div>
            <span class="text-xs text-neutral-500">状態：</span>
            <!-- ★ Node ステータス：status.ts の定義を使用 -->
            <span
              class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
              :class="nodeStatusDisplay.class"
            >
              {{ nodeStatusDisplay.text }}
            </span>
          </div>
        </div>
      </div>

      <!-- ステータス -->
      <div class="pt-3 border-t border-neutral-200">
        <div class="text-xs text-neutral-500 mb-1">ステータス</div>
        <!-- ★ VM ステータス：status.ts の定義を使用 -->
        <span
          class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
          :class="vmStatusDisplay.class"
        >
          {{ vmStatusDisplay.text }}
        </span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { VirtualMachineDTO } from "~~/shared/types/dto/virtual-machine/VirtualMachineDTO";
import { getNodeStatusDisplay, getVmStatusDisplay } from "@/utils/status";

// API の DTO をベースに、画面用に statusJa だけ足した型（互換のためそのまま残しておく）
type VmContext = VirtualMachineDTO & {
  statusJa?: string;
};

const props = defineProps<{
  context: VmContext;
}>();

// context は ResourceDetailShell 側で必ず渡される想定なので、そのまま使う
const vm = computed(() => props.context);

// ノードステータス（status.ts を使用）
const nodeStatusDisplay = computed(() => {
  const status = vm.value.node?.status ?? "";
  return getNodeStatusDisplay(status);
});

// VMステータス（status.ts を使用）
const vmStatusDisplay = computed(() => {
  // statusJa を使う運用をやめて、status.ts を単一の定義元にする
  const status = vm.value.status ?? "";
  return getVmStatusDisplay(status);
});
</script>
