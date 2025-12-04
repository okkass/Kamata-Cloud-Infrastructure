<template>
  <section class="space-y-4">
    <h2 class="text-lg font-semibold">基本情報</h2>

    <div class="rounded-lg border border-neutral-200 bg-white p-4 space-y-4">
      <!-- 名前 -->
      <div>
        <div class="text-xs text-neutral-500">名前</div>
        <div class="text-base font-medium text-neutral-900">
          {{ group.name || "—" }}
        </div>
      </div>

      <!-- 説明 -->
      <div>
        <div class="text-xs text-neutral-500">説明</div>
        <div class="text-sm text-neutral-900">
          {{ group.description || "—" }}
        </div>
      </div>

      <!-- 作成日時 & ルール数 -->
      <div class="pt-3 border-t border-neutral-200 grid gap-3 md:grid-cols-2">
        <div>
          <div class="text-xs text-neutral-500 mb-1">作成日時</div>
          <div class="text-sm font-medium text-neutral-900">
            {{ formatDateTime(group.createdAt) }}
          </div>
        </div>

        <div>
          <div class="text-xs text-neutral-500 mb-1">ルール数</div>
          <div class="text-sm font-medium text-neutral-900">
            合計 {{ totalRules }} 件
            <span class="ml-2 text-xs text-neutral-600">
              （インバウンド {{ inboundCount }} / アウトバウンド
              {{ outboundCount }}）
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { formatDateTime } from "@/utils/date";

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

const props = defineProps<{
  context: SecurityGroupResponse;
}>();

const group = computed(() => props.context);

const totalRules = computed(() => group.value.rules?.length ?? 0);
const inboundCount = computed(
  () => group.value.rules?.filter((r) => r.ruleType === "inbound").length ?? 0
);
const outboundCount = computed(
  () => group.value.rules?.filter((r) => r.ruleType === "outbound").length ?? 0
);
</script>
