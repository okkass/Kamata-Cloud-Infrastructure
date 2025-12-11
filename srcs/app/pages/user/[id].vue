<!-- /workspace/srcs/app/pages/user/[id].vue -->
<template>
  <div class="detail-container">
    <div v-if="pending" class="text-loading">読み込み中…</div>

    <div v-else-if="error" class="error-text">
      エラーが発生しました：{{ error.message }}
    </div>

    <ResourceDetailShell
      v-else
      title="利用者詳細"
      subtitle="User Information"
      :tabs="userTabs"
      :context="user!"
      :actions="actions"
      @back="goBack"
      @action="handleAction"
    />

    <!-- 編集モーダル（範囲外なので触らない） -->
    <MoUserEdit
      v-if="user"
      :show="isEditOpen"
      :user-data="user"
      @close="handleEditClose"
      @success="handleEditSuccess"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * User 詳細ページ (トースト削除済み)
 * - ローカル表示用型のみ使用
 * - タブと完全一致
 * - ResourceDetailShell 前提のレイアウト
 */

import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import ResourceDetailShell from "~/components/detail/ResourceDetailShell.vue";
import { userTabs } from "~/composables/detail/useUserTabs";
import { useResourceDetail } from "~/composables/useResourceDetail";
import { USER } from "@/utils/constants";
import MoUserEdit from "~/components/MoUserEdit.vue";

// ------------------------------------------------------
// 画面専用 User 型（タブに合わせた最小構成）
// ------------------------------------------------------
type UserDetailView = {
  id: string;
  name: string;
  email: string;
  createdAt?: string | null;
  lastLoginAt?: string | null;

  // 管理者権限
  isAdmin: boolean;
  isImageAdmin: boolean;
  isInstanceTypeAdmin: boolean;
  isPhysicalNodeAdmin: boolean;

  // リソース上限
  maxCpuCore?: number | null;
  maxMemorySize?: number | null;
  maxStorageSize?: number | null;
};

// ------------------------------------------------------
// ルーティング
// ------------------------------------------------------
const route = useRoute();
const router = useRouter();

// ------------------------------------------------------
// データ取得
// ------------------------------------------------------
const {
  data: user,
  pending,
  error,
  refresh,
} = await useResourceDetail<UserResponse>(USER.name, route.params.id as string);

// ------------------------------------------------------
// 戻るボタン
// ------------------------------------------------------
const goBack = () => router.back();

// ------------------------------------------------------
// 操作メニュー（編集のみ）
// ------------------------------------------------------
const actions = ref([{ label: "編集", value: "edit" }]);

const isEditOpen = ref(false);

const handleAction = (action: { label: string; value: string }) => {
  if (action.value === "edit") {
    isEditOpen.value = true;
  }
};

const handleEditClose = () => {
  isEditOpen.value = false;
};

// 編集成功時
const handleEditSuccess = async () => {
  isEditOpen.value = false;

  // トースト削除済み → 何も表示しない

  // 再取得
  if (typeof refresh === "function") {
    try {
      await refresh();
    } catch (e) {
      console.error("利用者情報の再取得に失敗しました", e);
    }
  }
};
</script>
