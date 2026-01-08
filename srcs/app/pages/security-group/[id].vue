<!-- /workspace/srcs/app/pages/security-group/[id].vue -->
<template>
  <div class="mx-auto max-w-6xl px-4 py-6">
    <!-- 初回ロードだけ表示（以降はチカチカ防止で常時シェル表示） -->
    <div v-if="!securityGroup && pending" class="text-sm text-neutral-500">
      読み込み中…
    </div>

    <div v-else-if="!securityGroup && error" class="text-sm text-red-500">
      エラーが発生しました：{{ error.message }}
    </div>

    <!-- securityGroup が一度でも取得できたら、以降は常にこれ -->
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

    <!-- 編集モーダル（モーダル側を触らず、ページ側で初期値注入を保証） -->
    <MoSecurityGroupEdit
      :show="isEditOpen"
      :security-group-data="editSecurityGroupData"
      @close="handleEditClose"
      @success="handleEditSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";

import ResourceDetailShell from "~/components/detail/ResourceDetailShell.vue";
import { securityGroupTabs } from "~/composables/detail/useSecurityGroupTabs";
import { useResourceDetail } from "~/composables/useResourceDetail";
import { SECURITY_GROUP } from "@/utils/constants";
import MoSecurityGroupEdit from "~/components/MoSecurityGroupEdit.vue";
import { createPolling } from "@/utils/polling";

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

// --- ポーリング設定（refresh失敗はログだけ） ---
const polling = createPolling(async () => {
  try {
    await refresh();
  } catch (e) {
    console.error("SecurityGroupの再取得に失敗しました", e);
  }
});

onMounted(() => polling.startPolling());
onUnmounted(() => polling.stopPolling());

// 戻る
const goBack = () => {
  router.back();
};

// 操作メニュー（編集のみ）
const actions = ref([{ label: "編集", value: "edit" }]);

// 編集モーダル
const isEditOpen = ref(false);

// ★ モーダルに渡すデータ（“変化”を作って初期化を確実にする）
const editSecurityGroupData = ref<SecurityGroupResponse | null>(null);

const openEditModal = async () => {
  if (!securityGroup.value) return;

  // 同じ参照を渡し続けるとモーダル側のwatchが発火しない実装があるため、
  // null を挟んで「確実に props の変化」を作る
  editSecurityGroupData.value = null;
  await nextTick();

  editSecurityGroupData.value = securityGroup.value;
  isEditOpen.value = true;
};

const handleEditClose = () => {
  isEditOpen.value = false;
};

const handleEditSuccess = async () => {
  isEditOpen.value = false;

  try {
    await refresh();
  } catch (e) {
    console.error("SecurityGroup再取得に失敗しました", e);
  }

  // 次回の編集でも確実に初期化が走るよう、最新をセットしておく（保険）
  if (securityGroup.value) {
    editSecurityGroupData.value = securityGroup.value;
  }
};

// 編集中はポーリング停止（更新チカチカ防止）
watch(
  () => isEditOpen.value,
  (open) => {
    if (open) polling.stopPolling();
    else polling.startPolling();
  }
);

// アクション実行
const handleAction = async (action: { label: string; value: string }) => {
  if (action.value === "edit") {
    await openEditModal();
  }
};
</script>
