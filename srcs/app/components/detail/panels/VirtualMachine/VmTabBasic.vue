<template>
  <section class="space-y-4">
    <h2 class="text-lg font-semibold">基本情報</h2>

    <!-- 基本情報カード -->
    <div class="rounded-lg border border-neutral-200 bg-white p-4 space-y-3">
      <div>
        <div class="text-xs text-neutral-500">Name</div>
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
            <span
              class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
              :class="nodeStatus.class"
            >
              {{ nodeStatus.text }}
            </span>
          </div>
        </div>
      </div>

      <!-- ステータス -->
      <div class="pt-3 border-t border-neutral-200">
        <div class="text-xs text-neutral-500 mb-1">ステータス</div>
        <span
          class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
          :class="vmStatus.class"
        >
          {{ vmStatus.text }}
        </span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { getVmStatusDisplay, getNodeStatusDisplay } from "~/utils/status";

/**
 * このタブで使う分だけの「表示用型」
 * DTO（Response 型）は使わず、画面で参照するフィールドだけ定義
 */
type VmBasicContext = {
  id?: string;
  name?: string;
  createdAt?: string;
  status?: string;
  statusJa?: string;
  node?: {
    name?: string;
    ipAddress?: string;
    status?: string;
  };
};

const props = defineProps<{
  context: VmBasicContext | null | undefined;
}>();

// null / undefined ガード
const vm = computed<VmBasicContext>(() => props.context ?? {});

// ノードステータス（バッジ表示用）
const nodeStatus = computed(() => {
  const raw = vm.value.node?.status ?? "";
  return getNodeStatusDisplay(raw);
});

// VMステータス（バッジ表示用）
const vmStatus = computed(() => {
  const raw = vm.value.status ?? "";

  // API が日本語を返してくる場合は text だけ差し替え
  const base = getVmStatusDisplay(raw);
  if (vm.value.statusJa) {
    return {
      ...base,
      text: vm.value.statusJa,
    };
  }
  return base;
});
</script>
