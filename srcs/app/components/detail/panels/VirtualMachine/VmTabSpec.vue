<template>
  <section class="space-y-4">
    <h2 class="text-lg font-semibold">構成</h2>

    <div class="rounded-lg border border-neutral-200 bg-white p-4 space-y-4">
      <!-- CPU / メモリ -->
      <dl class="space-y-3 text-sm">
        <div>
          <dt class="text-xs text-neutral-500">CPUコア</dt>
          <dd class="text-sm text-neutral-900 font-medium">
            {{ cpuDisplay }}
          </dd>
        </div>

        <div>
          <dt class="text-xs text-neutral-500">メモリサイズ</dt>
          <dd class="text-sm text-neutral-900 font-medium">
            {{ memoryDisplay }}
          </dd>
        </div>
      </dl>

      <!-- ストレージ -->
      <div class="pt-3 border-t border-neutral-200">
        <h3 class="mb-2 text-sm font-semibold text-neutral-700">
          ストレージ
        </h3>

        <div class="space-y-2">
          <article
            v-for="s in storages"
            :key="s.id"
            class="rounded-lg border border-neutral-200 px-4 py-3"
          >
            <p class="text-xs text-neutral-500">
              {{ s.name }}
            </p>
            <p class="text-sm text-neutral-900 font-medium">
              サイズ：{{ sizeGb(s.size) }}GB
            </p>
            <p class="text-sm text-neutral-900 font-medium">
              プール: {{ s.poolLabel }}
            </p>
          </article>

          <p
            v-if="storages.length === 0"
            class="text-sm text-neutral-500"
          >
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
import type { components } from "~~/shared/types";

type VirtualMachineResponse =
  components["schemas"]["VirtualMachineResponse"];

// 表示用ストレージ型
type StorageView = {
  id: string;
  name: string;
  size: number;
  poolLabel: string;
};

// ★ 必要なフィールドだけ Pick（cpuCore / memorySize / storages）
type VmSpecContext = Pick<
  VirtualMachineResponse,
  "cpuCore" | "memorySize" | "storages"
>;

const props = defineProps<{
  context?: VmSpecContext | null;
}>();

const vm = computed(() => props.context ?? ({} as VmSpecContext));

/** CPU コア数 */
const cpuDisplay = computed(() => {
  const cores = vm.value.cpuCore;
  if (typeof cores !== "number" || !Number.isFinite(cores)) {
    return "—";
  }
  return cores;
});

/** メモリサイズ（byte → MB） */
const memoryDisplay = computed(() => {
  const bytes = vm.value.memorySize;
  if (typeof bytes !== "number" || !Number.isFinite(bytes) || bytes <= 0) {
    return "—";
  }
  const mb = convertByteToUnit(bytes, "MB");
  return `${mb}MB`;
});

/** ストレージ一覧 */
const storages = computed<StorageView[]>(() => {
  const list = vm.value.storages ?? [];
  if (!Array.isArray(list)) return [];

  return list.map((s) => ({
    id: s.id,
    name: s.name,
    size: s.size,
    poolLabel: s.pool?.name ?? s.pool?.id ?? "—",
  }));
});

const sizeGb = (bytes: number) => {
  if (typeof bytes !== "number" || !Number.isFinite(bytes) || bytes < 0) {
    return "—";
  }
  return convertByteToUnit(bytes, "GB");
};
</script>
