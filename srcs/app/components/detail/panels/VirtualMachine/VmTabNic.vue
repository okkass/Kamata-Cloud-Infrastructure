<template>
  <section class="space-y-4">
    <h2 class="text-lg font-semibold">ネットワークインターフェース</h2>

    <div class="detail-card space-y-4">
      <div v-if="nics.length > 0" class="space-y-6">
        <div v-for="nic in nics" :key="nic.id" class="space-y-3">
          <div>
            <div class="detail-label">NIC ID</div>
            <div class="detail-value">{{ nic.id }}</div>
          </div>

          <div>
            <div class="detail-label">サブネットID</div>
            <div class="detail-value">{{ nic.subnetId || "—" }}</div>
          </div>

          <div>
            <div class="detail-label">IPアドレス</div>
            <div class="detail-value">{{ nic.ipAddress || "—" }}</div>
          </div>

          <div>
            <div class="detail-label">MACアドレス</div>
            <div class="detail-value">{{ nic.macAddress || "—" }}</div>
          </div>

          <hr v-if="nics.length > 1" class="border-neutral-200 pt-2" />
        </div>
      </div>

      <p v-else class="text-sm text-neutral-500">
        ネットワークインターフェースは接続されていません。
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";

type VirtualMachineResponse = components["schemas"]["VirtualMachineResponse"];

type NicView = {
  id: string;
  subnetId?: string;
  ipAddress?: string;
  macAddress?: string;
};

const props = defineProps<{
  context?: VirtualMachineResponse | null;
}>();

const nics = computed<NicView[]>(() => {
  const list = props.context?.networkInterfaces ?? [];
  if (!Array.isArray(list)) return [];

  return list.map((nic) => ({
    id: nic.id,
    subnetId: nic.subnet?.id,
    ipAddress: nic.ipAddress,
    macAddress: nic.macAddress,
  }));
});
</script>
