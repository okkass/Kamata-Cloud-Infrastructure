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
        <div class="text-sm text-neutral-900 font-medium ">
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
            <span class="text-sm text-neutral-900 font-medium ">{{ vm.node?.name || "-" }}</span>
          </div>
          <div>
            <span class="text-xs text-neutral-500">IPアドレス：</span>
            <span class="text-sm font-medium">{{ vm.node?.ipAddress || "-" }}</span>
          </div>
          <div>
            <span class="text-xs text-neutral-500">状態：</span>
            <span class="text-sm font-medium">
              {{ nodeStatusJa }}
            </span>
          </div>
        </div>
      </div>

      <!-- ステータス -->
      <div class="pt-3 border-t border-neutral-200">
        <div class="text-xs text-neutral-500 mb-1">ステータス</div>
        <div class="text-sm font-medium">
          {{ vmStatusText }}
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  context: any;
}>();

// null ガード
const vm = computed(() => props.context ?? {});

// ノードステータス（日本語）
const nodeStatusJa = computed(() => {
  const s = vm.value.node?.status;
  if (!s) return "-";

  switch (s) {
    case "active":
      return "稼働中";
    case "inactive":
    case "down":
      return "停止";
    default:
      return s;
  }
});

// VMステータス（日本語）
const vmStatusText = computed(() => {
  // APIが日本語を返してくる場合
  if (vm.value.statusJa) return vm.value.statusJa;

  const s = vm.value.status;
  if (!s) return "-";

  switch (s) {
    case "running":
      return "稼働中";
    case "stopped":
      return "停止中";
    case "error":
      return "エラー";
    default:
      // 想定外（例: provisioning, creating など）はそのまま返す
      return s;
  }
});
</script>
