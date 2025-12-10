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
        <!-- ★ 変更: 生の createdAt ではなく formatDateTime を利用 -->
        <div class="text-sm text-neutral-900 font-medium">
          {{ formatDateTime(user.createdAt) }}
        </div>
      </div>

      <!-- 最終ログイン日時 -->
      <div>
        <div class="text-xs text-neutral-500">最終ログイン</div>
        <!-- ★ 変更: lastLoginAt も formatDateTime で表示 -->
        <div class="text-sm text-neutral-900 font-medium">
          {{ formatDateTime(user.lastLoginAt) }}
        </div>
      </div>

      <!-- 管理者フラグ（UserResponse.isAdmin） -->
      <div class="pt-3 border-t border-neutral-200">
        <div class="text-xs text-neutral-500 mb-1">全体管理者</div>
        <div class="text-sm text-neutral-900 font-medium">
          <!-- ★ 変更: isAdmin を日本語表示 -->
          {{ user.isAdmin ? "有効" : "無効" }}
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
// ★ 変更: 日付フォーマットは共通 util を利用
import { formatDateTime } from "@/utils/date";

// ★ 変更: UserResponse を元にした「画面用ローカル型」をこのファイル内だけで定義
//   - DTO / Response 型は import しない方針
type UserView = {
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

// ★ 変更: context の型を UserView に固定（any をやめる）
const props = defineProps<{
  context: UserView;
}>();

// ★ 変更: そのまま props.context を握り替えるだけの computed
const user = computed(() => props.context);
</script>
