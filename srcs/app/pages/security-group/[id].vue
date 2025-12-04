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

  <!-- 今後 編集モーダル等を足したい場合はここに MoSecurityGroupEdit を置く -->
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import ResourceDetailShell from "~/components/detail/ResourceDetailShell.vue";
import { securityGroupTabs } from "~/composables/detail/useSecurityGroupTabs";
import { useResourceDetail } from "~/composables/useResourceDetail";
import { SECURITY_GROUP } from "@/utils/constants";

type SecurityRule = {
  id: string;
  name: string;
  ruleType: "inbound" | "outbound";
  port?: number | null;
  protocol: "tcp" | "udp" | "icmp" | "any";
  targetIp: string;
  action?: "allow" | "deny";
  createdAt: string;
};

type SecurityGroupResponse = {
  id: string;
  name: string;
  description?: string;
  rules: SecurityRule[];
  createdAt: string;
};

const route = useRoute();
const router = useRouter();

// /api/security-groups/:id を叩く想定
const {
  data: securityGroup,
  pending,
  error,
} = await useResourceDetail<SecurityGroupResponse>(
  SECURITY_GROUP.name, // "security-groups"
  route.params.id as string
);

// 操作（今は編集プレースホルダーだけ）
const actions = ref([{ label: "編集", value: "edit" }]);

const handleAction = (action: { label: string; value: string }) => {
  console.log("SecurityGroup action:", action.value);
  // 将来 MoSecurityGroupEdit を開く処理をここに追加
};

const goBack = () => {
  router.back();
};
</script>
