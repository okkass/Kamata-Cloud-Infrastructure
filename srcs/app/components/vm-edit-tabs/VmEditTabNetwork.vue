<template>
  <div class="p-6 h-full overflow-y-auto">
    <div class="max-w-4xl space-y-8">
      <section>
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-5 text-gray-500"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
              />
            </svg>
            ネットワークインターフェース
          </h3>
          <button
            type="button"
            @click="addInterface"
            class="text-sm px-3 py-1.5 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
          >
            + インターフェース追加
          </button>
        </div>

        <div v-if="networksPending" class="text-sm text-gray-500 mb-2">
          ネットワーク情報を取得中...
        </div>

        <div class="space-y-4">
          <div
            v-for="(iface, index) in model.networkInterfaces"
            :key="iface.id || index"
            class="p-4 bg-gray-50 rounded-lg border border-gray-100 relative group"
          >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
              <FormSelect
                label="接続ネットワーク"
                :name="`net-id-${index}`"
                v-model="iface.networkId"
                :options="networkOptions"
                placeholder="ネットワークを選択"
                @update:model-value="iface.subnetId = ''"
              />

              <FormSelect
                label="サブネット"
                :name="`subnet-id-${index}`"
                v-model="iface.subnetId"
                :options="getSubnetOptions(iface.networkId)"
                placeholder="サブネットを選択"
                :disabled="!iface.networkId"
              />

              <FormInput
                label="IPアドレス"
                :name="`ip-${index}`"
                v-model="iface.ipAddress"
                placeholder="自動割り当て"
                readonly
                class="bg-gray-200 text-gray-500 cursor-not-allowed"
              />
            </div>

            <button
              type="button"
              @click="removeInterface(index)"
              class="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-200 transition-colors"
              title="削除"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                class="w-5 h-5"
              >
                <path
                  d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
                />
              </svg>
            </button>
          </div>

          <div
            v-if="
              !model.networkInterfaces || model.networkInterfaces.length === 0
            "
            class="text-center text-gray-400 py-8 border-2 border-dashed rounded-lg"
          >
            インターフェースがありません
          </div>
        </div>
      </section>

      <hr class="border-gray-200" />

      <section>
        <h3
          class="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-5 text-gray-500"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
            />
          </svg>
          セキュリティグループ
        </h3>

        <div class="flex gap-2 mb-4">
          <FormSelect
            name="sg-select"
            v-model="selectedSgId"
            :options="availableSgOptions"
            placeholder="セキュリティグループを追加..."
            class="w-64"
          />
          <button
            type="button"
            @click="addSecurityGroup"
            :disabled="!selectedSgId"
            class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            追加
          </button>
        </div>

        <div class="flex flex-wrap gap-2">
          <div
            v-for="(sg, index) in model.securityGroups"
            :key="sg.id"
            class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100"
          >
            {{ sg.name }}
            <button
              type="button"
              @click="removeSecurityGroup(index)"
              class="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-800 transition-colors"
            >
              <span class="sr-only">削除</span>
              <svg
                class="h-3 w-3"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div
            v-if="!model.securityGroups || model.securityGroups.length === 0"
            class="text-sm text-gray-400 py-1"
          >
            割り当てなし
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import FormInput from "~/components/Form/Input.vue";
import FormSelect from "~/components/Form/Select.vue";
import { useResourceList } from "~/composables/useResourceList";

// 親コンポーネントからのモデル受け取り
const model = defineModel<any>({ required: true });

// ----------------------------------------------------------------------------
// Network Data Fetching
// ----------------------------------------------------------------------------
const { data: networkMaster, pending: networksPending } =
  useResourceList<VirtualNetworkResponse>("virtual-networks");
const { data: securityGroupMaster } =
  useResourceList<SecurityGroupResponse>("security-groups");

// Select用オプション作成
const networkOptions = computed(() => {
  return (networkMaster.value || []).map((net) => ({
    id: net.id,
    name: `${net.name} (${net.cidr})`,
  }));
});

// ----------------------------------------------------------------------------
// Network Interfaces Logic
// ----------------------------------------------------------------------------

const getSubnetOptions = (networkId: string) => {
  const network = networkMaster.value?.find((n) => n.id === networkId);
  if (!network || !network.subnets) return [];
  return network.subnets.map((subnet) => ({
    id: subnet.id,
    name: `${subnet.name} (${subnet.cidr})`,
  }));
};

const addInterface = () => {
  if (!model.value) return;
  if (!Array.isArray(model.value.networkInterfaces)) {
    model.value.networkInterfaces = [];
  }

  model.value.networkInterfaces.push({
    // ★重要: useResourceUpdater の "newIdPrefix" ("new-") に合わせたIDを付与
    id: `new-${Date.now()}`,
    networkId: "",
    subnetId: "",
    ipAddress: "",
  });
};

const removeInterface = (index: number) => {
  if (!model.value?.networkInterfaces) return;
  model.value.networkInterfaces.splice(index, 1);
};

// ----------------------------------------------------------------------------
// Security Groups Logic
// ----------------------------------------------------------------------------

const selectedSgId = ref<string>("");

// 追加可能なSGリスト（既に割り当て済みのものは除外）
const availableSgOptions = computed(() => {
  const currentIds = new Set(
    (model.value?.securityGroups || []).map((sg: any) => sg.id)
  );

  return (securityGroupMaster.value || [])
    .filter((sg) => !currentIds.has(sg.id))
    .map((sg) => ({
      id: sg.id,
      name: sg.name,
    }));
});

const addSecurityGroup = () => {
  if (!selectedSgId.value || !model.value) return;

  const sgToAdd = securityGroupMaster.value?.find(
    (sg) => sg.id === selectedSgId.value
  );

  if (sgToAdd) {
    if (!Array.isArray(model.value.securityGroups)) {
      model.value.securityGroups = [];
    }
    // セキュリティグループは既存リソースの紐付けなので、一時IDは不要でそのままpush
    model.value.securityGroups.push(sgToAdd);
    selectedSgId.value = ""; // リセット
  }
};

const removeSecurityGroup = (index: number) => {
  if (!model.value?.securityGroups) return;
  model.value.securityGroups.splice(index, 1);
};
</script>
