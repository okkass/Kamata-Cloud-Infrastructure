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
            {{ context.cpuCore }}
          </dd>
        </div>

        <div>
          <dt class="text-xs text-neutral-500">メモリサイズ</dt>
          <dd class="text-sm text-neutral-900 font-medium ">
            {{ convertByteToUnit(context.memorySize, "MB") }}MB
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

const props = defineProps<{
  context: any;
}>();

// props をそのまま使いやすくするだけ（型崩れ防止）
const context = computed(() => props.context ?? {});
</script>
