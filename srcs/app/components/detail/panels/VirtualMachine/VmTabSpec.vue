<template>
  <section class="space-y-4">
    <h2 class="text-lg font-semibold">構成</h2>

    <div class="detail-card">
      <dl class="detail-grid-2col">
        <div>
          <dt class="detail-label">CPUコア</dt>
          <dd class="detail-value">{{ context.cpuCore }} コア</dd>
        </div>

        <div>
          <dt class="detail-label">メモリサイズ</dt>
          <dd class="detail-value">
            {{ convertByteToUnit(context.memorySize, "MB") }} MB
          </dd>
        </div>
      </dl>

      <div class="detail-card-section">
        <h3 class="detail-heading-sm">ストレージ</h3>

        <div class="space-y-2">
          <article
            v-for="(item, index) in context.attachedStorages"
            :key="index"
            class="rounded-lg border border-neutral-200 px-4 py-3"
          >
            <div class="mb-2">
              <div class="detail-value">
                {{ item.storage.name }}
              </div>
            </div>

            <dl class="grid gap-2 grid-cols-2">
              <div>
                <dt class="detail-label">サイズ</dt>
                <dd class="detail-value text-xs">
                  {{ convertByteToUnit(item.storage.size, "GB") }} GB
                </dd>
              </div>
              <div>
                <dt class="detail-label">プール</dt>
                <dd class="detail-value text-xs font-mono">
                  {{ item.storage.pool }}
                </dd>
              </div>
            </dl>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";

// 本来は shared/types から import するのが理想ですが、元のコードに合わせて any を許容
const props = defineProps<{
  context: any;
}>();

const context = computed(() => props.context ?? {});

// ※ convertByteToUnit は auto-import か何かで使えている想定で残しています
</script>
