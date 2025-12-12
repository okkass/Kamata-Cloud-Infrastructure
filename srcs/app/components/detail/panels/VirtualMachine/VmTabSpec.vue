<!-- /workspace/srcs/app/components/detail/panels/VirtualMachine/VmTabSpec.vue -->
<template>
  <section class="space-y-4">
    <h2 class="text-lg font-semibold">構成</h2>

    <div class="detail-card space-y-4">

      <!-- CPU / メモリ -->
      <dl class="space-y-3 text-sm">
        <div>
          <dt class="detail-label">CPUコア</dt>
          <dd class="detail-value">{{ cpuDisplay }}</dd>
        </div>

        <div>
          <dt class="detail-label">メモリサイズ</dt>
          <dd class="detail-value">{{ memoryDisplay }}</dd>
        </div>
      </dl>

      <!-- ストレージ -->
      <div class="detail-card-section">
        <h3 class="text-sm font-semibold text-neutral-700">ストレージ</h3>

        <div class="space-y-2 mt-2">
          <article
            v-for="s in storages"
            :key="s.id"
            class="rounded-lg border border-neutral-200 px-4 py-3"
          >
            <p class="text-xs text-neutral-500">{{ s.name }}</p>

            <p class="text-sm text-neutral-900 font-medium">
              サイズ：{{ convertByteToUnit(s.size, "GB") }}GB
            </p>

            <p class="text-sm text-neutral-900 font-medium">
              プール: {{ s.poolLabel }}
            </p>
          </article>

          <p v-if="storages.length === 0" class="text-sm text-neutral-500">
            ストレージは接続されていません。
          </p>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { convertByteToUnit } from "~/utils/format";

type VirtualMachineResponse =
  components["schemas"]["VirtualMachineResponse"];

type StorageView = {
  id: string;
  name: string;
  size: number;
  poolLabel: string;
};

const props = defineProps<{
  context?: VirtualMachineResponse | null;
}>();

const vm = computed(() => props.context);

/** CPU コア数 */
const cpuDisplay = computed(() => {
  const cores = vm.value?.cpuCore;
  return typeof cores === "number" ? cores : "—";
});

/** メモリサイズ（byte → MB） */
const memoryDisplay = computed(() => {
  const bytes = vm.value?.memorySize;
  if (typeof bytes !== "number" || !Number.isFinite(bytes)) return "—";
  return `${convertByteToUnit(bytes, "MB")}MB`;
});

/** ストレージ一覧 */
const storages = computed<StorageView[]>(() => {
  const list = vm.value?.storages ?? [];
  if (!Array.isArray(list)) return [];

  return list.map((s) => ({
    id: s.id,
    name: s.name,
    size: s.size,
    poolLabel: s.pool?.name ?? s.pool?.id ?? "—",
  }));
});
</script>
