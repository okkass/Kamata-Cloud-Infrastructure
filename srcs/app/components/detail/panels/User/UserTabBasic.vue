<template>
  <section class="space-y-4">
    <h2 class="text-lg font-semibold">基本情報</h2>

    <div class="detail-card">
      <div>
        <div class="detail-label">名前</div>
        <div class="detail-value text-base">
          {{ user.name || "—" }}
        </div>
      </div>

      <div>
        <div class="detail-label">メールアドレス</div>
        <div class="detail-value font-mono">
          {{ user.email || "—" }}
        </div>
      </div>

      <div class="detail-card-section detail-grid-2col">
        <div>
          <div class="detail-heading-sm">作成日時</div>
          <div class="detail-value">
            {{ formatDateTime(user.createdAt) }}
          </div>
        </div>
        <div>
          <div class="detail-heading-sm">最終ログイン日時</div>
          <div class="detail-value">
            {{ formatDateTime(user.lastLoginAt) }}
          </div>
        </div>
      </div>

      <div class="detail-card-section">
        <div class="detail-heading-sm">権限</div>

        <div class="flex flex-wrap gap-2">
          <span
            class="detail-pill"
            :class="user.isAdmin ? 'detail-pill-yes' : 'detail-pill-no'"
          >
            管理者: {{ user.isAdmin ? "はい" : "いいえ" }}
          </span>

          <span
            class="detail-pill"
            :class="user.isImageAdmin ? 'detail-pill-yes' : 'detail-pill-no'"
          >
            イメージ管理者: {{ user.isImageAdmin ? "はい" : "いいえ" }}
          </span>

          <span
            class="detail-pill"
            :class="
              user.isInstanceTypeAdmin ? 'detail-pill-yes' : 'detail-pill-no'
            "
          >
            インスタンスタイプ管理者:
            {{ user.isInstanceTypeAdmin ? "はい" : "いいえ" }}
          </span>

          <span
            class="detail-pill"
            :class="
              user.isPhysicalNodeAdmin ? 'detail-pill-yes' : 'detail-pill-no'
            "
          >
            物理ノード管理者:
            {{ user.isPhysicalNodeAdmin ? "はい" : "いいえ" }}
          </span>
        </div>
      </div>

      <div class="detail-card-section">
        <div class="detail-heading-sm">リソース上限</div>

        <dl class="space-y-1">
          <div class="flex flex-wrap gap-2 items-baseline">
            <dt class="detail-label w-32">CPUコア</dt>
            <dd class="detail-value">
              {{ cpuLimitText }}
            </dd>
          </div>

          <div class="flex flex-wrap gap-2 items-baseline">
            <dt class="detail-label w-32">メモリ</dt>
            <dd class="detail-value">
              {{ memoryLimitText }}
            </dd>
          </div>

          <div class="flex flex-wrap gap-2 items-baseline">
            <dt class="detail-label w-32">ストレージ</dt>
            <dd class="detail-value">
              {{ storageLimitText }}
            </dd>
          </div>
        </dl>
      </div>

      <div v-if="user.totpInfo" class="detail-card-section">
        <div class="detail-heading-sm">多要素認証 (TOTP)</div>
        <p class="detail-value">
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
