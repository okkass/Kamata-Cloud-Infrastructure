<template>
  <section class="space-y-4">
    <h2 class="text-lg font-semibold">基本情報</h2>

    <div class="detail-card">
      <div class="detail-grid-2col">
        <div>
          <div class="detail-label">名前</div>
          <div class="detail-value text-base">
            {{ vm.name }}
          </div>
        </div>

        <div>
          <div class="detail-label">作成日時</div>
          <div class="detail-value">
            {{ vm.createdAt || "-" }}
          </div>
        </div>
      </div>

      <div class="detail-card-section">
        <div class="detail-heading-sm">ノード</div>

        <dl class="detail-grid-2col">
          <div>
            <dt class="detail-label">名前</dt>
            <dd class="detail-value">
              {{ vm.node?.name || "-" }}
            </dd>
          </div>
          <div>
            <dt class="detail-label">IPアドレス</dt>
            <dd class="detail-value font-mono">
              {{ vm.node?.ipAddress || "-" }}
            </dd>
          </div>
          <div>
            <dt class="detail-label">状態</dt>
            <dd class="mt-1">
              <span class="detail-pill" :class="nodeStatusDisplay.class">
                {{ nodeStatusDisplay.text }}
              </span>
            </dd>
          </div>
        </dl>
      </div>

      <div class="detail-card-section">
        <div class="detail-heading-sm">VMステータス</div>
        <div>
          <span class="detail-pill" :class="vmStatusDisplay.class">
            {{ vmStatusDisplay.text }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { getNodeStatusDisplay, getVmStatusDisplay } from "@/utils/status";

// 型定義はそのまま維持
type VmContext = VirtualMachineDTO & {
  statusJa?: string;
};

const props = defineProps<{
  context: VmContext;
}>();

const vm = computed(() => props.context);

const nodeStatusDisplay = computed(() => {
  const status = vm.value.node?.status ?? "";
  return getNodeStatusDisplay(status);
});

const vmStatusDisplay = computed(() => {
  const status = vm.value.status ?? "";
  return getVmStatusDisplay(status);
});
</script>
