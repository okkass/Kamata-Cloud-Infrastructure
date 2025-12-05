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
  </div>

  <!-- ★ 編集モーダル -->
  <MoUserEdit
    :show="isEditOpen"
    :user-data="userForEdit"
    @close="handleEditClose"
    @success="handleEditSuccess"
  />
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import ResourceDetailShell from "~/components/detail/ResourceDetailShell.vue";
import { userTabs } from "~/composables/detail/useUserTabs";
import { useResourceDetail } from "~/composables/useResourceDetail";
import { USER } from "@/utils/constants";
import MoUserEdit from "~/components/MoUserEdit.vue";

type UserDetail = {
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

const route = useRoute();
const router = useRouter();

// /api/users/:id を叩く想定
const {
  data: user,
  pending,
  error,
} = await useResourceDetail<UserDetail>(
  USER.name, // "users"
  route.params.id as string
);

// --------------------
// 操作メニュー
// --------------------
const actions = ref([{ label: "編集", value: "edit" }]);

// 編集モーダルの開閉状態
const isEditOpen = ref(false);

// モーダルに渡すユーザーデータ
const userForEdit = computed(() => user.value ?? null);

// 操作ボタンのハンドラ
const handleAction = (action: { label: string; value: string }) => {
  if (action.value === "edit") {
    isEditOpen.value = true;
  }
};

// モーダル close
const handleEditClose = () => {
  isEditOpen.value = false;
};

// モーダル保存成功時
const handleEditSuccess = (updated?: UserDetail) => {
  // composable側で更新後のユーザーデータを emit してくれるなら反映する
  if (updated) {
    // ref なので代入で上書きしてOK
    (user as any).value = updated;
  }
  isEditOpen.value = false;
};

// 戻る
const goBack = () => {
  router.back();
};
</script>
