<template>
  <div class="mx-auto max-w-6xl px-4 py-6">
    <!-- 初回ロードだけ表示（以降はチカチカ防止で常時シェル表示） -->
    <div v-if="!securityGroup && pending" class="text-sm text-neutral-500">
      読み込み中…
    </div>

    <div v-else-if="!securityGroup && error" class="text-sm text-red-500">
      エラーが発生しました：{{ error.message }}
    </div>

    <!-- securityGroup が一度でも取れたら、以降は常にこれ -->
    <ResourceDetailShell
      v-else
      title="セキュリティグループ詳細"
      subtitle="Security Group Information"
      :tabs="securityGroupTabs"
      :context="securityGroup!"
      :actions="actions"
      @back="goBack"
      @action="handleAction"
    />

    <!-- 編集モーダル -->
    <MoSecurityGroupEdit
      v-if="securityGroup"
      :show="isEditOpen"
      :security-group-data="securityGroup"
      @close="handleEditClose"
      @success="handleEditSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";

import ResourceDetailShell from "~/components/detail/ResourceDetailShell.vue";
import { securityGroupTabs } from "~/composables/detail/useSecurityGroupTabs";
import { useResourceDetail } from "~/composables/useResourceDetail";
import { SECURITY_GROUP } from "@/utils/constants";
import MoSecurityGroupEdit from "~/components/MoSecurityGroupEdit.vue";
import { createPolling } from "@/utils/polling";

type SecurityGroupResponse = components["schemas"]["SecurityGroupResponse"];

const route = useRoute();
const router = useRouter();

const {
  data: securityGroup,
  pending,
  error,
  refresh,
} = await useResourceDetail<SecurityGroupResponse>(
  SECURITY_GROUP.name, // "security-groups"
  route.params.id as string
);

// --- ポーリング設定 ---
const polling = createPolling(async () => {
  try {
    await refresh();
  } catch (e) {
    console.error("ポーリング中のデータ取得に失敗しました", e);
  }
});

// lifecycle
onMounted(() => {
  polling.startPolling();
});

onUnmounted(() => {
  polling.stopPolling();
});

// 操作メニュー（編集のみ）
const actions = ref([{ label: "編集", value: "edit" }]);

// 編集モーダル
const isEditOpen = ref(false);

const openEditModal = () => {
  if (!securityGroup.value) return;
  isEditOpen.value = true;
};

const handleEditClose = () => {
  isEditOpen.value = false;
  // モーダルを閉じる際はポーリングを再開
  polling.startPolling();
};

const handleEditSuccess = async () => {
  isEditOpen.value = false;

  try {
    await refresh();
  } catch (e) {
    console.error("SecurityGroup再取得に失敗しました", e);
  }

  // 保存成功後はポーリングを再開（refresh直後だが次回から通常動作）
  polling.startPolling();
};

// 編集中はポーリング停止（更新チカチカ防止）
// ポーリング再開は各ハンドラ（handleEditClose, handleEditSuccess）で個別に制御
watch(
  () => isEditOpen.value,
  (open) => {
    if (open) {
      polling.stopPolling();
    }
  }
);

// 戻る
const goBack = () => {
  router.back();
};

// アクション実行
const handleAction = (action: { label: string; value: string }) => {
  if (!securityGroup.value) return;

  if (action.value === "edit") {
    openEditModal();
  }
};
</script>
