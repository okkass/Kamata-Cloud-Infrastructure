<template>
  <section class="rounded-2xl border border-neutral-200 bg-white p-6">
    <h2 class="mb-4 text-lg font-semibold">構成</h2>

    <!-- CPU / メモリ -->
    <dl class="space-y-3 text-sm">
      <div>
        <dt class="font-medium">CPUコア</dt>
        <dd class="mt-0.5 text-neutral-800">
          {{ context.cpuCore }}
        </dd>
      </div>

      <div>
        <dt class="font-medium">メモリサイズ</dt>
        <dd class="mt-0.5 text-neutral-800">
          {{ convertByteToUnit(context.memorySize, "MB") }}MB
        </dd>
      </div>
    </dl>

    <!-- アタッチストレージ -->
    <h3 class="mt-6 mb-2 text-sm font-semibold text-neutral-700">
      ストレージ
    </h3>

    <div class="space-y-2">
      <article
        v-for="(item, index) in context.attachedStorages"
        :key="index"
        class="rounded-2xl border border-neutral-200 px-4 py-3"
      >
        <p class="text-sm font-medium">
          {{ item.storage.name }}
        </p>
        <p class="text-xs text-neutral-600">
          サイズ：
          {{ convertByteToUnit(item.storage.size, "GB") }}GB
        </p>
        <p class="text-xs text-neutral-600">
          プール:
          {{ item.storage.pool }}
        </p>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue"

const props = defineProps<{
  context: any
}>()

// props をそのまま使いやすくするだけ（型崩れ防止）
const context = computed(() => props.context ?? {})
</script>
