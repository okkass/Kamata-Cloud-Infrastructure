<template>
  <section class="space-y-4">
    <h2 class="text-lg font-semibold">基本情報</h2>

    <div class="detail-card">
      <div>
        <div class="detail-label">名前</div>
        <div class="detail-value text-base">
          {{ group.name || "—" }}
        </div>
      </div>

      <div>
        <div class="detail-label">説明</div>
        <div class="detail-value">
          {{ group.description || "—" }}
        </div>
      </div>

      <div class="detail-card-section detail-grid-2col">
        <div>
          <div class="detail-heading-sm">作成日時</div>
          <div class="detail-value">
            {{ formatDateTime(group.createdAt) }}
          </div>
        </div>

        <div>
          <div class="detail-heading-sm">ルール数</div>
          <div class="detail-value">
            合計 {{ totalRules }} 件
            <span class="ml-2 text-xs text-neutral-500 font-normal">
              (In: {{ inboundCount }} / Out: {{ outboundCount }})
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
