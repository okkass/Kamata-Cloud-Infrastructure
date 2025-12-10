<template>
  <section class="space-y-4">
    <h2 class="text-lg font-semibold">ネットワークインターフェース</h2>

    <div class="rounded-lg border border-neutral-200 bg-white p-4 space-y-4">
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
            <div class="text-sm text-neutral-900 font-medium ">
              {{ nic.subnet?.id ?? "—" }}
              <!-- ★ API の構造に合わせて subnetId → subnet.id に変更 -->
            </div>
          </div>

          <div>
            <div class="text-xs text-neutral-500">IPアドレス</div>
            <div class="text-sm text-neutral-900 font-medium">
              {{ nic.ipAddress || "—" }}
            </div>
          </div>

          <hr
            v-if="nics.length > 1"
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
import type { components } from "~~/shared/types";

// ★ API 定義の型を使用（自作型禁止 → VirtualMachineResponse に統一）
type VirtualMachineResponse =
  components["schemas"]["VirtualMachineResponse"];

const props = defineProps<{
  context?: VirtualMachineResponse | null; // ★ context の型を正式スキーマに変更
}>();

// ★ 元データ：context.networkInterfaces を使用（API 名に合わせた）
const nics = computed(() => props.context?.networkInterfaces ?? []);
</script>
