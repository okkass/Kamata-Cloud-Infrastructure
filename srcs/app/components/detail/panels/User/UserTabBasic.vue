<!-- srcs/app/components/detail/panels/User/UserTabBasic.vue -->
<template>
  <section class="space-y-4">
    <h2 class="text-lg font-semibold">基本情報</h2>

    <div class="rounded-lg border border-neutral-200 bg-white p-4 space-y-4">
      <!-- 名前 -->
      <div>
        <div class="text-xs text-neutral-500">名前</div>
        <div class="text-base font-medium text-neutral-900">
          {{ user.name || "—" }}
        </div>
      </div>

      <!-- メールアドレス -->
      <div>
        <div class="text-xs text-neutral-500">メールアドレス</div>
        <div class="text-sm font-mono text-neutral-900">
          {{ user.email || "—" }}
        </div>
      </div>

      <!-- 作成日時 / 最終ログイン -->
      <div class="pt-3 border-t border-neutral-200 grid gap-3 md:grid-cols-2">
        <div>
          <div class="text-xs text-neutral-500 mb-1">作成日時</div>
          <div class="text-sm text-neutral-900 font-medium">
            {{ formatDateTime(user.createdAt) }}
          </div>
        </div>
        <div>
          <div class="text-xs text-neutral-500 mb-1">最終ログイン日時</div>
          <div class="text-sm text-neutral-900 font-medium">
            {{ formatDateTime(user.lastLoginAt) }}
          </div>
        </div>
      </div>

      <!-- 権限系フラグ -->
      <div class="pt-3 border-t border-neutral-200 space-y-2">
        <div class="text-xs text-neutral-500 mb-1">権限</div>

        <div class="flex flex-wrap gap-2 text-xs">
          <span
            class="inline-flex items-center rounded-full px-2 py-0.5 font-medium"
            :class="user.isAdmin ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'"
          >
            管理者: {{ user.isAdmin ? "はい" : "いいえ" }}
          </span>

          <span
            class="inline-flex items-center rounded-full px-2 py-0.5 font-medium"
            :class="user.isImageAdmin ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'"
          >
            イメージ管理者: {{ user.isImageAdmin ? "はい" : "いいえ" }}
          </span>

          <span
            class="inline-flex items-center rounded-full px-2 py-0.5 font-medium"
            :class="user.isInstanceTypeAdmin ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'"
          >
            インスタンスタイプ管理者:
            {{ user.isInstanceTypeAdmin ? "はい" : "いいえ" }}
          </span>

          <span
            class="inline-flex items-center rounded-full px-2 py-0.5 font-medium"
            :class="user.isPhysicalNodeAdmin ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'"
          >
            物理ノード管理者:
            {{ user.isPhysicalNodeAdmin ? "はい" : "いいえ" }}
          </span>
        </div>
      </div>

      <!-- リソース上限 -->
      <div class="pt-3 border-t border-neutral-200 space-y-2">
        <div class="text-xs text-neutral-500 mb-1">リソース上限</div>

        <dl class="space-y-1 text-sm">
          <div class="flex flex-wrap gap-2">
            <dt class="w-32 text-neutral-500">CPUコア</dt>
            <dd class="font-medium text-neutral-900">
              {{ cpuLimitText }}
            </dd>
          </div>

          <div class="flex flex-wrap gap-2">
            <dt class="w-32 text-neutral-500">メモリ</dt>
            <dd class="font-medium text-neutral-900">
              {{ memoryLimitText }}
            </dd>
          </div>

          <div class="flex flex-wrap gap-2">
            <dt class="w-32 text-neutral-500">ストレージ</dt>
            <dd class="font-medium text-neutral-900">
              {{ storageLimitText }}
            </dd>
          </div>
        </dl>
      </div>

      <!-- MFA 情報（あれば） -->
      <div
        v-if="user.totpInfo"
        class="pt-3 border-t border-neutral-200 space-y-1"
      >
        <div class="text-xs text-neutral-500 mb-1">多要素認証 (TOTP)</div>
        <p class="text-sm text-neutral-900">
          設定済み（シークレットキー／QRコード情報あり）
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { formatDateTime } from "@/utils/date";
import { toSize } from "@/utils/format";

type UserResponse = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  isAdmin: boolean;
  lastLoginAt: string;
  maxCpuCore?: number | null;
  maxMemorySize?: number | null;
  maxStorageSize?: number | null;
  totpInfo?: {
    secret: string;
    uri: string;
  };
  isImageAdmin: boolean;
  isInstanceTypeAdmin: boolean;
  isPhysicalNodeAdmin: boolean;
};

const props = defineProps<{
  context: UserResponse;
}>();

const user = computed(() => props.context);

// リソース上限の表示用テキスト
const cpuLimitText = computed(() => {
  if (user.value.maxCpuCore == null) return "制限なし";
  return `${user.value.maxCpuCore} cores`;
});

const memoryLimitText = computed(() => {
  if (user.value.maxMemorySize == null) return "制限なし";
  return toSize(user.value.maxMemorySize);
});

const storageLimitText = computed(() => {
  if (user.value.maxStorageSize == null) return "制限なし";
  return toSize(user.value.maxStorageSize);
});
</script>
