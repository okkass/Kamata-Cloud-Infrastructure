<template>
  <section class="space-y-4">
    <h2 class="text-lg font-semibold">基本情報</h2>

    <div class="rounded-lg border border-neutral-200 bg-white p-4 space-y-3">
      <!-- 名前 -->
      <div>
        <div class="text-xs text-neutral-500">名前</div>
        <div class="text-sm text-neutral-900 font-medium">
          {{ user.name || "—" }}
        </div>
      </div>

      <!-- メールアドレス -->
      <div>
        <div class="text-xs text-neutral-500">メールアドレス</div>
        <div class="text-sm text-neutral-900 font-medium font-mono">
          {{ user.email || "—" }}
        </div>
      </div>

      <!-- 作成日時 -->
      <div>
        <div class="text-xs text-neutral-500">作成日時</div>
        <div class="text-sm text-neutral-900 font-medium">
          {{ formatDateTime(user.createdAt) }}
        </div>
      </div>

      <!-- 最終ログイン日時 -->
      <div>
        <div class="text-xs text-neutral-500">最終ログイン</div>
        <div class="text-sm text-neutral-900 font-medium">
          {{ formatDateTime(user.lastLoginAt) }}
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { formatDateTime } from "@/utils/date";

// DTO/Response は使わず、画面用のシンプルな型だけ定義
type UserDetailView = {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
  lastLoginAt?: string;
};

const props = defineProps<{
  context: UserDetailView;
}>();

const user = computed(() => props.context);
</script>
