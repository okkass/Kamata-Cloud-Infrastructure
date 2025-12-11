<template>
  <section class="space-y-4">
    <h2 class="text-lg font-semibold">権限・リソース上限</h2>

    <div class="rounded-lg border border-neutral-200 bg-white p-4 space-y-6">
      <!-- 管理者権限 -->
      <div>
        <div class="text-xs text-neutral-500 mb-2">管理者権限</div>

        <div v-if="hasAnyAdmin" class="flex flex-wrap gap-2 text-xs">
          <span
            v-for="item in adminFlags"
            :key="item.key"
            class="inline-flex items-center rounded-full px-3 py-1 border"
            :class="
              item.enabled
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-50 text-slate-400 border-slate-200'
            "
          >
            {{ item.label }}
          </span>
        </div>

        <p v-else class="text-sm text-neutral-500">
          管理者権限は付与されていません。
        </p>
      </div>

      <!-- リソース上限 -->
      <div class="pt-4 border-t border-neutral-200">
        <div class="text-xs text-neutral-500 mb-2">リソース上限</div>

        <div
          class="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3"
        >
          <div>
            <div class="text-xs text-neutral-500">最大 vCPU (コア)</div>
            <div class="text-sm text-neutral-900 font-medium">
              {{ maxCpuText }}
            </div>
          </div>
          <div>
            <div class="text-xs text-neutral-500">最大メモリ</div>
            <div class="text-sm text-neutral-900 font-medium">
              {{ maxMemoryText }}
            </div>
          </div>
          <div>
            <div class="text-xs text-neutral-500">最大ストレージ</div>
            <div class="text-sm text-neutral-900 font-medium">
              {{ maxStorageText }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { UserServerBase } from "~~/shared/types/dto/user/UserServerBase";

const props = defineProps<{
  context: UserServerBase;
}>();

const user = computed(() => props.context);

// 管理者フラグを配列にまとめる
const adminFlags = computed(() => [
  {
    key: "admin",
    label: "全体管理者",
    enabled: user.value.isAdmin,
  },
  {
    key: "image",
    label: "イメージ管理",
    enabled: user.value.isImageAdmin,
  },
  {
    key: "instanceType",
    label: "インスタンスタイプ管理",
    enabled: user.value.isInstanceTypeAdmin,
  },
  {
    key: "physicalNode",
    label: "物理ノード管理",
    enabled: user.value.isPhysicalNodeAdmin,
  },
]);

const hasAnyAdmin = computed(() =>
  adminFlags.value.some((flag) => flag.enabled)
);

// リソース上限表示
const maxCpuText = computed(() =>
  user.value.maxCpuCore == null ? "制限なし" : `${user.value.maxCpuCore} コア`
);

const maxMemoryText = computed(() =>
  user.value.maxMemorySize == null
    ? "制限なし"
    : `${Math.round(user.value.maxMemorySize / (1024 * 1024 * 1024))} GB`
);

const maxStorageText = computed(() =>
  user.value.maxStorageSize == null
    ? "制限なし"
    : `${Math.round(user.value.maxStorageSize / (1024 * 1024 * 1024))} GB`
);
</script>
