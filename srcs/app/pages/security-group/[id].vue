<template>
  <div>
    <div v-if="pending">Loading...</div>
    <div v-if="error">Error: {{ error.message }}</div>
    <div v-if="data">
      <pre>{{ data }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import ResourceDetailShell from "~/components/detail/ResourceDetailShell.vue";
import { securityGroupTabs } from "~/composables/detail/useSecurityGroupTabs";
import { useResourceDetail } from "~/composables/useResourceDetail";
import { SECURITY_GROUP } from "@/utils/constants";
import MoSecurityGroupEdit from "~/components/MoSecurityGroupEdit.vue";

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
