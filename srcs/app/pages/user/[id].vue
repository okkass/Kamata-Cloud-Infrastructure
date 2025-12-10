<template>
  <div class="mx-auto max-w-6xl px-4 py-6">
    <div v-if="pending" class="text-sm text-neutral-500">読み込み中…</div>

    <div v-else-if="error" class="text-sm text-red-500">
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

    <!-- 編集モーダル -->
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
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import ResourceDetailShell from "~/components/detail/ResourceDetailShell.vue";
import { userTabs } from "~/composables/detail/useUserTabs";
import { useResourceDetail } from "~/composables/useResourceDetail";
import { USER } from "@/utils/constants";
import MoUserEdit from "~/components/MoUserEdit.vue";
import { useToast } from "@/composables/useToast";

const { addToast } = useToast();

// 画面用の User 型（DTO / Response はインポートしない）
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

const route = useRoute();
const router = useRouter();

const {
  data: user,
  pending,
  error,
  refresh,
} = await useResourceDetail<UserDetailView>(
  USER.name, // "users"
  route.params.id as string
);

const goBack = () => {
  router.back();
};

// 操作メニュー（とりあえず編集のみ）
const actions = ref([{ label: "編集", value: "edit" }]);

// 編集モーダル開閉
const isEditOpen = ref(false);

const handleAction = (action: { label: string; value: string }) => {
  if (!user.value) return;
  if (action.value === "edit") {
    isEditOpen.value = true;
  }
};

const handleEditClose = () => {
  isEditOpen.value = false;
};

const handleEditSuccess = async () => {
  isEditOpen.value = false;

  addToast({
    message: "利用者情報を更新しました（モック）",
    type: "success",
  });

  if (typeof refresh === "function") {
    try {
      await refresh();
    } catch (e) {
      console.error("利用者情報の再取得に失敗しました", e);
    }
  }
};
</script>
