<template>
  <section class="space-y-4">
    <h2 class="text-lg font-semibold">構成</h2>

    <!-- 基本スペック -->
    <div class="rounded-lg border border-neutral-200 bg-white p-4 space-y-3">
      <div>
        <div class="text-xs text-neutral-500">CPUコア</div>
        <div class="text-sm font-medium">
          {{ vm.cpuCore }} コア
        </div>
      </div>

      <div>
        <div class="text-xs text-neutral-500">メモリサイズ</div>
        <div class="text-sm font-medium">
          {{ convertByteToUnit(context.memorySize, "MB") }}MB
        </div>
      </div>
    </div>

    <!-- アタッチストレージ -->
    <div class="rounded-lg border border-neutral-200 bg-white p-4">
      <h3 class="mb-3 text-sm font-semibold text-neutral-700">
        アタッチストレージ
      </h3>

      <div v-if="storages.length === 0" class="text-sm text-neutral-500">
        アタッチされているストレージはありません。
      </div>

      <ul v-else class="space-y-2">
        <li
          v-for="s in storages"
          :key="s.id"
          class="rounded-md border border-neutral-200 px-3 py-2 text-sm"
        >
          <div class="font-medium">{{ s.name }}</div>
          <div class="text-xs text-neutral-500">
            サイズ: {{ s.sizeDisplay }}
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  context: any;
}>();

const vm = computed(() => props.context ?? {});

// attachedStorages は親側で整形済み想定
// 例: [{ id, name, sizeGb }] など
const storages = computed(() => {
  const raw = vm.value.attachedStorages ?? [];
  return raw.map((s: any) => ({
    id: s.id ?? s.storageId ?? s.name,
    name: s.name ?? s.storage?.name ?? "(no name)",
    sizeDisplay:
      s.sizeDisplay ??
      (s.sizeGb != null ? `${s.sizeGb}GB` : s.size != null ? `${s.size}GB` : "-"),
  }));
});
</script>
