<template>
  <section class="space-y-4">
    <h2 class="text-lg font-semibold">権限・リソース上限</h2>

    <div class="rounded-lg border border-neutral-200 bg-white p-4 space-y-6">

      <!-- 権限 -->
      <div>
        <h3 class="text-sm font-semibold text-neutral-800 mb-2">管理者権限</h3>

        <div class="grid gap-2 md:grid-cols-2">
          <PermissionItem label="全体管理者" :value="user.isAdmin" />
          <PermissionItem label="イメージ管理" :value="user.isImageAdmin" />
          <PermissionItem label="インスタンスタイプ管理" :value="user.isInstanceTypeAdmin" />
          <PermissionItem label="物理ノード管理" :value="user.isPhysicalNodeAdmin" />
        </div>
      </div>

      <!-- リソース上限 -->
      <div class="pt-4 border-t border-neutral-200">
        <h3 class="text-sm font-semibold text-neutral-800 mb-2">リソース上限</h3>

        <dl class="grid gap-3 md:grid-cols-3 text-sm">
          <div>
            <dt class="text-xs text-neutral-500 mb-1">最大 vCPU (コア)</dt>
            <dd class="font-medium text-neutral-900">
              {{ cpuLimitText }}
            </dd>
          </div>

          <div>
            <dt class="text-xs text-neutral-500 mb-1">最大メモリ</dt>
            <dd class="font-medium text-neutral-900">
              {{ memoryLimitText }}
            </dd>
          </div>

          <div>
            <dt class="text-xs text-neutral-500 mb-1">最大ストレージ</dt>
            <dd class="font-medium text-neutral-900">
              {{ storageLimitText }}
            </dd>
          </div>
        </dl>
      </div>

    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, defineComponent } from "vue";

type UserDetailView = {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
  lastLoginAt?: string;
  isAdmin: boolean;
  isImageAdmin: boolean;
  isInstanceTypeAdmin: boolean;
  isPhysicalNodeAdmin: boolean;
  maxCpuCore?: number | null;
  maxMemorySize?: number | null;
  maxStorageSize?: number | null;
};

const props = defineProps<{
  context: UserDetailView;
}>();

const user = computed(() => props.context);

// リソース上限表示
const cpuLimitText = computed(() => {
  const v = user.value.maxCpuCore;
  return v == null ? "制限なし" : `${v} コア`;
});

const memoryLimitText = computed(() => {
  const bytes = user.value.maxMemorySize;
  if (bytes == null) return "制限なし";
  return `${Math.round(bytes / 1024 ** 3)} GB`;
});

const storageLimitText = computed(() => {
  const bytes = user.value.maxStorageSize;
  if (bytes == null) return "制限なし";
  return `${Math.round(bytes / 1024 ** 3)} GB`;
});

// PermissionItem（ローカルコンポーネント）
const PermissionItem = defineComponent({
  name: "PermissionItem",
  props: {
    label: { type: String, required: true },
    value: { type: Boolean, required: true },
  },
  setup(props) {
    const text = computed(() => (props.value ? "有効" : "無効"));
    const cls = computed(() =>
      props.value
        ? "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
        : "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200"
    );

    return { text, cls };
  },
  template: `
    <div class="flex items-center justify-between rounded-md border border-neutral-200 px-3 py-2">
      <span class="text-xs text-neutral-700">{{ label }}</span>
      <span :class="cls">{{ text }}</span>
    </div>
  `,
});
</script>
