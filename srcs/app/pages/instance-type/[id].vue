<template>
  <div class="mx-auto max-w-6xl px-4 py-6">
    <div v-if="pending" class="text-sm text-neutral-500">
      読み込み中…
    </div>

    <div v-else-if="error" class="text-sm text-red-500">
      エラーが発生しました：{{ error.message }}
    </div>

    <ResourceDetailShell
      v-else
      :title="`${INSTANCE_TYPE.label}詳細`"
      subtitle="Instance Type Information"
      :tabs="instanceTypeTabs"
      :context="instanceType!"
      :actions="actions"
      @back="goBack"
      @action="handleAction"
    />

    <!-- 編集モーダル（トーストはモーダル側に任せる） -->
    <MoInstanceTypeEdit
      v-if="instanceType"
      :show="isEditOpen"
      :data="instanceType"
      @close="handleEditClose"
      @success="handleEditSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import ResourceDetailShell from "~/components/detail/ResourceDetailShell.vue";
import MoInstanceTypeEdit from "~/components/MoInstanceTypeEdit.vue";
import { INSTANCE_TYPE } from "@/utils/constants";
import { instanceTypeTabs } from "~/composables/detail/useInstanceTypeTabs";
import { useResourceDetail } from "~/composables/useResourceDetail";

const route = useRoute();
const router = useRouter();

const {
  data: instanceType,
  pending,
  error,
  refresh,
} = await useResourceDetail<InstanceTypeResponse>(
  INSTANCE_TYPE.name,
  route.params.id as string
);

// 戻る
const goBack = () => {
  router.back();
};

// 操作メニュー（最小）
const actions = ref([{ label: "編集", value: "edit" }]);

// 編集モーダル制御
const isEditOpen = ref(false);

const openEditModal = () => {
  if (!instanceType.value) return;
  isEditOpen.value = true;
};

const handleEditClose = () => {
  isEditOpen.value = false;
};

const handleEditSuccess = async () => {
  isEditOpen.value = false;

  // トーストはモーダル側に任せる
  if (typeof refresh === "function") {
    try {
      await refresh();
    } catch (e) {
      console.error("InstanceType再取得に失敗しました", e);
    }
  }
};

const handleAction = (action: { label: string; value: string }) => {
  if (action.value === "edit") {
    openEditModal();
  }
};
</script>
