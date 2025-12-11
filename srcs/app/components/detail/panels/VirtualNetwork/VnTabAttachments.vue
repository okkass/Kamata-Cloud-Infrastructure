<template>
  <section class="space-y-4">
    <h2 class="text-lg font-semibold">接続リソース</h2>

    <div class="detail-card space-y-4">
      <!-- ローディング -->
      <p v-if="loading" class="text-loading">
        接続されているリソースを取得しています…
      </p>

      <!-- エラー -->
      <p v-else-if="error" class="text-error">
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
            <div class="detail-label">サブネット</div>
            <div class="detail-value">
              {{ group.subnetName || "（名称未設定）" }}
              <span class="ml-2 font-mono text-xs text-neutral-600">
                ({{ group.cidr || "CIDR 未設定" }})
              </span>
            </div>
          </div>

          <!-- VM一覧 -->
          <div class="space-y-2">
            <NuxtLink
              v-for="vm in group.vms"
              :key="vm.id"
              :to="`/machine/${vm.id}`"
              class="block rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm hover:border-indigo-300 hover:shadow-sm transition"
            >
              <div class="flex items-center justify-between">
                <div class="font-medium text-neutral-900">
                  {{ vm.name }}
                </div>
                <span
                  class="text-xs px-2 py-0.5 rounded-full"
                  :class="statusDisplay(vm.status).class"
                >
                  {{ statusDisplay(vm.status).text }}
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
                  {{ formatDateTime(vm.createdAt) }}
                </span>
              </div>
            </NuxtLink>
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
import { formatDateTime } from "@/utils/date";
import { getVmStatusDisplay } from "@/utils/status";

const props = defineProps<{
  context?: VirtualNetworkResponse;
}>();

const loading = ref(false);
const error = ref<unknown | null>(null);

// VM の接続情報を保持（自作型は定義せず any で受ける）
const attachments = ref<any[]>([]);

onMounted(async () => {
  const vnetId = props.context?.id;
  const subnets = props.context?.subnets ?? [];

  if (!vnetId || subnets.length === 0) return;

  loading.value = true;
  try {
    const all: any[] = [];

    for (const subnet of subnets) {
      // エンドポイントは /virtual-machines 固定（設計どおり）
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

// データ有無
const hasData = computed(() => attachments.value.length > 0);

// サブネットごとに VM をグルーピング
const subnetGroups = computed(() => {
  const map = new Map<string, any>();

  for (const vm of attachments.value) {
    if (!map.has(vm.subnetId)) {
      map.set(vm.subnetId, {
        subnetId: vm.subnetId,
        subnetName: vm.subnetName,
        cidr: vm.cidr,
        vms: [] as any[],
      });
    }
    map.get(vm.subnetId)!.vms.push(vm);
  }

  return Array.from(map.values());
});

// status.ts の getVmStatusDisplay を薄ラップして使いやすく
const statusDisplay = (status: string) => getVmStatusDisplay(status);
</script>
