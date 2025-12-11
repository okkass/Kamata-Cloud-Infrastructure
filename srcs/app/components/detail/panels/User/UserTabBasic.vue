<template>
  <section class="space-y-4">
    <h2 class="detail-heading-sm">基本情報</h2>

    <div class="detail-card">
      <!-- 名前 -->
      <div>
        <div class="detail-label">名前</div>
        <div class="detail-value">
          {{ user.name || "—" }}
        </div>
      </div>

      <!-- メールアドレス -->
      <div>
        <div class="detail-label">メールアドレス</div>
        <div class="detail-value font-mono">
          {{ user.email || "—" }}
        </div>
      </div>

      <!-- 作成日時 -->
      <div>
        <div class="detail-label">作成日時</div>
        <div class="detail-value">
          {{ formatDateTime(user.createdAt) }}
        </div>
      </div>

      <!-- 最終ログイン日時 -->
      <div>
        <div class="detail-label">最終ログイン</div>
        <div class="detail-value">
          {{ formatDateTime(user.lastLoginAt) }}
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { formatDateTime } from "@/utils/date";

// ★ 画面用の最小限 User 型（ローカル定義のみ）
//   - DTO / Response 型は import しない

const props = defineProps<{
  context: UserResponse;
}>();

const user = computed(() => props.context);
</script>
