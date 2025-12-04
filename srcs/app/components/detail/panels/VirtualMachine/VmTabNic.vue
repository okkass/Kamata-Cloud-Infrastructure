<template>
  <section class="space-y-4">
    <h2 class="text-lg font-semibold">ネットワークインターフェース</h2>

    <!-- 外枠カード -->
    <div class="rounded-lg border border-neutral-200 bg-white p-4 space-y-4">
      <div v-if="nics.length > 0" class="space-y-6">
        <div
          v-for="(nic, index) in nics"
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

          <!-- 区切り線（最後の要素以外） -->
          <hr
            v-if="nics.length > 1 && index < nics.length - 1"
            class="border-neutral-200 pt-2"
          />
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
import type { VirtualMachineDTO } from "~~/shared/types/dto/virtual-machine/VirtualMachineDTO";

// NICタブで使うのは attachedNics だけなので Pick しておく
type VmContext = Pick<VirtualMachineDTO, "attachedNics">;

const props = defineProps<{
  context: VmContext;
}>();

const nics = computed(() => props.context.attachedNics ?? []);
</script>
