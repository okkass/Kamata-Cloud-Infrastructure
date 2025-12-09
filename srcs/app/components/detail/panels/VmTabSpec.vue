<template>
  <section class="space-y-4">
    <h2 class="text-lg font-semibold">構成</h2>

    <!-- ★ 基本情報タブと同じカードレイアウトに統一 -->
    <div class="rounded-lg border border-neutral-200 bg-white p-4 space-y-4">
      <!-- CPU / メモリ -->
      <dl class="space-y-3 text-sm">
        <div>
          <dt class="text-xs text-neutral-500">CPUコア</dt>
          <dd class="text-sm text-neutral-900 font-medium ">
            {{ cpuDisplay }}
          </dd>
        </div>

        <div>
          <dt class="text-xs text-neutral-500">メモリサイズ</dt>
          <dd class="text-sm text-neutral-900 font-medium ">
            {{ memoryDisplay }}
          </dd>
        </div>
      </dl>

      <!-- アタッチストレージ -->
      <div class="pt-3 border-t border-neutral-200">
        <h3 class="mb-2 text-sm font-semibold text-neutral-700">
          ストレージ
        </h3>

        <div class="space-y-2">
          <article
            v-for="(item, index) in context.attachedStorages"
            :key="index"
            class="rounded-lg border border-neutral-200 px-4 py-3"
          >
            <p class="text-xs text-neutral-500">
              {{ item.storage.name }}
            </p>
            <p class="text-sm text-neutral-900 font-medium">
              サイズ：
              {{ convertByteToUnit(item.storage.size, "GB") }}GB
            </p>
            <p class="text-sm text-neutral-900 font-medium">
              プール:
              {{ item.storage.pool }}
            </p>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { convertByteToUnit } from "~/utils/format";

/**
 * このタブで使う分だけの「表示用型」
 * DTO は使わず、必要なフィールドだけ定義
 */
type VmSpecContext = {
  cpuCore?: number;
  memorySize?: number; // bytes
  instanceType?: {
    cpuCore?: number;
    memorySize?: number; // bytes
  };
  attachedStorages?: {
    storage: {
      name: string;
      size: number;
      pool: string;
    };
  }[];
};

const props = defineProps<{
  context: VmSpecContext | null | undefined;
}>();

// null / undefined ガード
const context = computed(() => (props.context ?? {}) as VmSpecContext);

/**
 * CPUコア
 * - instanceType.cpuCore があれば優先
 * - なければ context.cpuCore
 */
const cpuDisplay = computed(() => {
  const cores =
    context.value.instanceType?.cpuCore ?? context.value.cpuCore;

  if (typeof cores !== "number" || !Number.isFinite(cores)) {
    return "—";
  }

  // ラベル側に「CPUコア」とあるので数値だけでOK
  return cores;
});

/**
 * メモリサイズ（MB）
 * - instanceType.memorySize があれば優先
 * - なければ context.memorySize
 * - 不正な値は "—" にして NaNMB を防ぐ
 */
const memoryDisplay = computed(() => {
  const bytes =
    context.value.instanceType?.memorySize ?? context.value.memorySize;

  if (typeof bytes !== "number" || !Number.isFinite(bytes) || bytes <= 0) {
    return "—";
  }

  const mb = convertByteToUnit(bytes, "MB");
  return `${mb}MB`;
});
</script>
