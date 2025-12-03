<template>
  <section class="space-y-4">
    <h2 class="text-lg font-semibold">ネットワークインターフェース</h2>

    <!-- NIC がある場合 -->
    <div v-if="nics.length > 0" class="space-y-3">
      <div
        v-for="nic in nics"
        :key="nic.id"
        class="rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm"
      >
        <dl class="space-y-2">
          <div>
            <dt class="text-xs text-neutral-500">NIC ID</dt>
            <dd class="font-mono break-all text-neutral-900">
              {{ nic.id }}
            </dd>
          </div>

          <div>
            <dt class="text-xs text-neutral-500">サブネットID</dt>
            <dd class="font-mono break-all text-neutral-900">
              {{ nic.subnetId || "—" }}
            </dd>
          </div>

          <div>
            <dt class="text-xs text-neutral-500">IPアドレス</dt>
            <dd class="text-neutral-900">
              {{ nic.ipAddress || "—" }}
            </dd>
          </div>
        </dl>
      </div>
    </div>

    <!-- NIC が 0 件のとき -->
    <p v-else class="text-sm text-neutral-500">
      ネットワークインターフェースは接続されていません。
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  context?: {
    attachedNics?: {
      id: string;
      subnetId?: string;
      ipAddress?: string;
    }[];
  };
}>();

// undefined ガードして配列に正規化
const nics = computed(() => props.context?.attachedNics ?? []);
</script>
