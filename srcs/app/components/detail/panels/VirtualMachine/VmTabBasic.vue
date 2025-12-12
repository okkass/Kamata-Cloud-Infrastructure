<template>
  <section class="space-y-4">
    <h2 class="text-lg font-semibold">基本情報</h2>

    <div class="detail-card">
      <div>
        <div class="detail-label">Name</div>
        <div class="detail-value">
          {{ vm?.name || "-" }}
        </div>
      </div>

      <div>
        <div class="detail-label">作成日時</div>
        <div class="detail-value">
          {{ formatDateTime(vm?.createdAt) }}
        </div>
      </div>

      <div class="detail-card-section">
        <div class="detail-heading-sm">ノード</div>

        <div class="space-y-1">
          <div>
            <span class="detail-label">名前：</span>
            <span class="detail-value">{{ vm?.node?.name || "-" }}</span>
          </div>

          <div>
            <span class="detail-label">IPアドレス：</span>
            <span class="detail-value">{{ vm?.node?.ipAddress || "-" }}</span>
          </div>

          <div>
            <span class="detail-label">状態：</span>
            <span class="detail-pill" :class="nodeStatus.class">
              {{ nodeStatus.text }}
            </span>
          </div>
        </div>
      </div>

      <div class="detail-card-section">
        <div class="detail-label mb-1">ステータス</div>
        <span class="detail-pill" :class="vmStatus.class">
          {{ vmStatus.text }}
        </span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { getVmStatusDisplay, getNodeStatusDisplay } from "~/utils/status";

type VirtualMachineResponse = components["schemas"]["VirtualMachineResponse"];

const props = defineProps<{
  context?: VirtualMachineResponse | null;
}>();

const vm = computed(() => props.context);

const nodeStatus = computed(() => {
  const raw = vm.value?.node?.status ?? "";
  return getNodeStatusDisplay(raw);
});

const vmStatus = computed(() => {
  const raw = vm.value?.status ?? "";
  return getVmStatusDisplay(raw);
});
</script>
