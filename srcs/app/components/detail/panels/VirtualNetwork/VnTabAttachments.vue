<template>
  <section class="space-y-4">
    <h2 class="text-lg font-semibold">接続リソース</h2>

    <div class="rounded-lg border border-neutral-200 bg-white p-4 space-y-4">
      <!-- ローディング -->
      <p v-if="loading" class="text-sm text-neutral-500">
        接続されているリソースを取得しています…
      </p>

      <!-- エラー -->
      <p v-else-if="error" class="text-sm text-red-500">
        接続リソースの取得に失敗しました：
        {{ (error as any).message || (error as any).statusMessage || error }}
      </p>

      <!-- データあり -->
      <div v-else-if="hasData" class="space-y-6">
        <div
          v-for="group in subnetGroups"
          :key="group.subnetId"
          class="space-y-3"
        >
          <!-- サブネット見出し -->
          <div>
            <div class="text-xs text-neutral-500">サブネット</div>
            <div class="text-sm text-neutral-900 font-medium">
              {{ group.subnetName || "（名称未設定）" }}
              <span class="ml-2 font-mono text-xs text-neutral-600">
                ({{ group.cidr || "CIDR 未設定" }})
              </span>
            </div>
          </div>

          <!-- VM一覧 -->
          <div class="space-y-2">
            <div
              v-for="vm in group.vms"
              :key="vm.id"
              class="rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm flex flex-col gap-1"
            >
              <div class="flex items-center justify-between">
                <!-- VM 詳細へのリンク -->
                <NuxtLink
                  :to="`/machine/${encodeURIComponent(String(vm.id))}`"
                  class="table-link font-medium"
                >
                  {{ vm.name }}
                </NuxtLink>

                <!-- ★ ステータスは getVmStatusDisplay を呼び出して表示 -->
                <span
                  class="text-xs px-2 py-0.5 rounded-full"
                  :class="getVmStatusDisplay(vm.status).class"
                >
                  {{ getVmStatusDisplay(vm.status).text }}
                </span>
              </div>

              <div class="text-xs text-neutral-600">
                ノード：
                <span class="font-medium text-neutral-900">
                  {{ vm.nodeName || "—" }}
                </span>
              </div>

              <div class="text-xs text-neutral-600">
                IPアドレス：
                <span class="font-mono">
                  {{ vm.ipAddress || "—" }}
                </span>
              </div>

              <div class="text-xs text-neutral-600">
                作成日時：
                <span>
                  {{ formatDate(vm.createdAt) }}
                </span>
              </div>
            </div>
          </div>

          <hr class="border-neutral-200" />
        </div>
      </div>

      <!-- データなし -->
      <p v-else class="text-sm text-neutral-500">
        接続されているリソースはありません。
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { getVmStatusDisplay } from "@/utils/status";

const props = defineProps<{
  context?: {
    id: string;
    subnets?: {
      id: string;
      name: string;
      cidr: string;
      possibleExternalConnection?: boolean;
      createdAt?: string;
    }[];
  };
}>();

type VmAttachment = {
  id: string;
  name: string;
  status: string;
  nodeName: string;
  ipAddress: string;
  createdAt?: string;
  subnetId: string;
  subnetName?: string;
  cidr?: string;
};

const loading = ref(false);
const error = ref<unknown | null>(null);
const attachments = ref<VmAttachment[]>([]);

onMounted(async () => {
  const vnetId = props.context?.id;
  const subnets = props.context?.subnets ?? [];

  if (!vnetId || subnets.length === 0) return;

  loading.value = true;
  try {
    const all: VmAttachment[] = [];

    for (const subnet of subnets) {
      const raw = await $fetch<any[]>(
        `/api/virtual-networks/${vnetId}/subnets/${subnet.id}/virtual-machines`
      );

      for (const vm of raw) {
        all.push({
          id: vm.id,
          name: vm.name,
          status: vm.status,
          nodeName: vm.node?.name ?? "",
          ipAddress: vm.networkInterfaces?.[0]?.ipAddress ?? "",
          createdAt: vm.createdAt,
          subnetId: subnet.id,
          subnetName: subnet.name,
          cidr: subnet.cidr,
        });
      }
    }

    attachments.value = all;
  } catch (e) {
    console.error("接続リソース取得エラー", e);
    error.value = e;
  } finally {
    loading.value = false;
  }
});

const hasData = computed(() => attachments.value.length > 0);

const subnetGroups = computed(() => {
  const map = new Map<
    string,
    { subnetId: string; subnetName?: string; cidr?: string; vms: VmAttachment[] }
  >();

  for (const vm of attachments.value) {
    if (!map.has(vm.subnetId)) {
      map.set(vm.subnetId, {
        subnetId: vm.subnetId,
        subnetName: vm.subnetName,
        cidr: vm.cidr,
        vms: [],
      });
    }
    map.get(vm.subnetId)!.vms.push(vm);
  }

  return Array.from(map.values());
});

function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
</script>
