<template>
  <section class="space-y-4">
    <h2 class="text-lg font-semibold">ネットワークインターフェース</h2>

    <div class="rounded-lg border border-neutral-200 bg-white p-4 space-y-4">
      <!-- NIC が 1 件以上ある場合 -->
      <div v-if="nics.length > 0" class="space-y-6">
        <div
          v-for="nic in nics"
          :key="nic.id"
          class="space-y-3"
        >
          <div>
            <div class="text-xs text-neutral-500">NIC ID</div>
            <div class="text-sm text-neutral-900 font-medium">
              {{ nic.id }}
            </div>
          </div>

          <div>
            <div class="text-xs text-neutral-500">サブネットID</div>
            <div class="text-sm text-neutral-900 font-medium">
              {{ nic.subnetId || "—" }}
            </div>
          </div>

          <div>
            <div class="text-xs text-neutral-500">IPアドレス</div>
            <div class="text-sm text-neutral-900 font-medium">
              {{ nic.ipAddress || "—" }}
            </div>
          </div>

          <div>
            <div class="text-xs text-neutral-500">MACアドレス</div>
            <div class="text-sm text-neutral-900 font-medium">
              {{ nic.macAddress || "—" }}
            </div>
          </div>

          <!-- サブネットCIDRも一応持っておく（今は表示しないが後で使える） -->
          <!--
          <div>
            <div class="text-xs text-neutral-500">サブネットCIDR</div>
            <div class="text-sm text-neutral-900 font-medium">
              {{ nic.subnetCidr || "—" }}
            </div>
          </div>
          -->

          <hr
            v-if="nics.length > 1"
            class="border-neutral-200 pt-2"
          />
        </div>
      </div>

      <!-- NIC が 0 件のとき -->
      <p v-else class="text-sm text-neutral-500">
        ネットワークインターフェースは接続されていません。
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { components } from "~~/shared/types";

type VirtualMachineResponse =
  components["schemas"]["VirtualMachineResponse"];

// networkInterfaces だけ Pick した表示用コンテキスト
type VmNicContext = Pick<VirtualMachineResponse, "networkInterfaces">;

type NicView = {
  id: string;
  subnetId?: string;
  ipAddress?: string;
  macAddress?: string;
  subnetCidr?: string;
};

const props = defineProps<{
  context?: VmNicContext | null;
}>();

const nics = computed<NicView[]>(() => {
  const list = props.context?.networkInterfaces ?? [];
  if (!Array.isArray(list)) return [];

  return list.map((nic) => ({
    id: nic.id,
    subnetId: nic.subnet?.id,
    ipAddress: nic.ipAddress,
    macAddress: nic.macAddress,
    subnetCidr: nic.subnet?.cidr,
  }));
});
</script>
