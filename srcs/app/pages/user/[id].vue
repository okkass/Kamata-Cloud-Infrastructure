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
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import ResourceDetailShell from "~/components/detail/ResourceDetailShell.vue";
import { userTabs } from "~/composables/detail/useUserTabs";
import { useResourceDetail } from "~/composables/useResourceDetail";
import { USER } from "@/utils/constants";

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

const {
  data: user,
  pending,
  error,
} = await useResourceDetail<UserDetail>(
  USER.name, // "users"
  route.params.id as string
);

const goBack = () => {
  router.back();
};

const actions = ref([{ label: "編集", value: "edit" }]);

const handleAction = (action: { label: string; value: string }) => {
  console.log("ユーザー詳細 操作:", action.value);
};
</script>
