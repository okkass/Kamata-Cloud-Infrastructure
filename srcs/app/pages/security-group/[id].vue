<template>
  <div class="mx-auto max-w-6xl px-4 py-6">
    <div v-if="pending" class="text-sm text-neutral-500">読み込み中…</div>

    <div v-else-if="error" class="text-sm text-red-500">
      エラーが発生しました：{{ error.message }}
    </div>

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
  </div>

  <!-- 編集モーダル（モック） -->
  <MoSecurityGroupEdit
    v-if="securityGroup"
    :show="isEditOpen"
    :security-group-data="securityGroup"
    @close="handleEditClose"
    @success="handleEditSuccess"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import ResourceDetailShell from "~/components/detail/ResourceDetailShell.vue";
import { securityGroupTabs } from "~/composables/detail/useSecurityGroupTabs";
import { useResourceDetail } from "~/composables/useResourceDetail";
import { SECURITY_GROUP } from "@/utils/constants";
import MoSecurityGroupEdit from "~/components/MoSecurityGroupEdit.vue";

type SecurityGroupResponse = components["schemas"]["SecurityGroupResponse"];

const route = useRoute();
const router = useRouter();

// /api/security-groups/:id を叩く想定
const {
  data: securityGroup,
  pending,
  error,
} = await useResourceDetail<SecurityGroupResponse>(
  SECURITY_GROUP.name,
  route.params.id as string
);

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

const handleEditSuccess = () => {
  isEditOpen.value = false;
  console.log("SecurityGroup edited (mock)");
};

const goBack = () => {
  router.back();
};
</script>
