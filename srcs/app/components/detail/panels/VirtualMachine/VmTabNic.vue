<template>
  <section class="space-y-4">
    <h2 class="text-lg font-semibold">ネットワークインターフェース</h2>

    <div class="detail-card">
      <div v-if="nics.length > 0" class="space-y-2">
        <article
          v-for="nic in nics"
          :key="nic.id"
          class="rounded-lg border border-neutral-200 px-4 py-3"
        >
          <dl class="grid gap-2 md:grid-cols-3">
            <div>
              <dt class="detail-label">NIC ID</dt>
              <dd class="detail-value text-xs font-mono">
                {{ nic.id }}
              </dd>
            </div>

            <div>
              <dt class="detail-label">サブネットID</dt>
              <dd class="detail-value text-xs font-mono">
                {{ nic.subnetId || "—" }}
              </dd>
            </div>

            <div>
              <dt class="detail-label">IPアドレス</dt>
              <dd class="detail-value text-xs font-mono">
                {{ nic.ipAddress || "—" }}
              </dd>
            </div>
          </dl>
        </article>
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

type VmContext = Pick<VirtualMachineDTO, "attachedNics">;

const props = defineProps<{
  context: VmContext;
}>();

const nics = computed(() => props.context.attachedNics ?? []);
</script>
