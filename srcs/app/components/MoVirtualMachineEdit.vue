<template>
  <BaseModal :show="show" :title="modalTitle" @close="$emit('close')" size="lg">
    <div class="flex flex-col">
      <div v-if="pending" class="text-center p-8">
        仮想マシンの情報を読み込み中...
      </div>
      <div v-else-if="error" class="text-center text-red-500 p-8">
        情報の読み込みに失敗しました。
      </div>
      <div v-else>
        <div class="flex border-b border-gray-200">
          <button
            type="button"
            v-for="(tab, index) in tabs"
            :key="tab.name"
            @click="currentTab = index"
            :class="[
              'relative py-2 px-4 text-sm font-medium',
              currentTab === index
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700',
            ]"
          >
            {{ tab.name }}
            <span
              v-if="!tabValidity[index]"
              class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
            ></span>
          </button>
        </div>
        <div class="pt-6">
          <component
            v-for="(tab, index) in tabs"
            :key="index"
            v-show="currentTab === index"
            :is="tab.component"
            :ref="
              (el) => {
                if (el) tabRefs[index] = el;
              }
            "
          />
        </div>
        <div
          class="flex justify-end items-center mt-6 pt-4 border-t border-gray-200"
        >
          <div class="flex gap-3">
            <SecondaryButton @click="prevTab" :disabled="currentTab === 0">
              戻る
            </SecondaryButton>
            <button
              type="button"
              v-if="currentTab < tabs.length - 1"
              @click="nextTab"
              class="btn-primary"
            >
              次へ
            </button>
            <button
              v-else
              @click="handleSubmit"
              :disabled="isUpdating"
              class="py-2 px-5 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 disabled:opacity-50"
            >
              {{ isUpdating ? "更新中..." : "更新" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
// (import文などは変更なし)
import { ref, markRaw, computed, watch } from "vue";
import { useToast } from "~/composables/useToast";
import VmEditTabGeneral from "~/components/vm-edit-tabs/VmEditTabGeneral.vue";
import VmEditTabConfig from "~/components/vm-edit-tabs/VmEditTabConfig.vue";
import VmEditTabNetwork from "~/components/vm-edit-tabs/VmEditTabNetwork.vue";

// (Props, Emitsは変更なし)
const props = defineProps({
  show: { type: Boolean, required: true },
  vmId: { type: String, default: null },
});
const emit = defineEmits(["close", "success"]);

// --- API (初期データ取得) ---
// ★ DTOの `pool` の型を string に修正
interface VmDetailDTO {
  id: string;
  name: string;
  node: { id: string; name: string };
  instanceType: { cpuCores: number; memorySize: number };
  attachedStorages: {
    storage: { id: string; name: string; size: number; pool: string };
    path: string;
  }[];
  attachedNics: { id: string; subnetId: string }[];
  securityGroups: { id: string; name: string }[];
}
const fetchUrl = computed(() =>
  props.vmId ? `/api/virtual-machines/${props.vmId}` : null
);
const {
  data: vmData,
  pending,
  error,
  refresh,
} = useFetch<VmDetailDTO>(fetchUrl, { immediate: false });

// (タブ定義、UI操作、handleSubmitは変更なし)
const tabs = [
  { name: "概要", component: markRaw(VmEditTabGeneral) },
  { name: "構成", component: markRaw(VmEditTabConfig) },
  { name: "ネットワーク", component: markRaw(VmEditTabNetwork) },
];
const tabRefs = ref<any[]>([]);
const currentTab = ref(0);
const modalTitle = ref("仮想マシン編集");
const prevTab = () => {
  if (currentTab.value > 0) currentTab.value--;
};
const nextTab = () => {
  if (currentTab.value < tabs.length - 1) currentTab.value++;
};
const tabValidity = computed(() =>
  tabRefs.value.map((tab) => tab?.isValid?.valid ?? false)
);
const { addToast } = useToast();
const isUpdating = ref(false);
const handleSubmit = async () => {
  /* ... */
};

// --- 初期値設定 ---
watch(
  () => props.show,
  async (isVisible) => {
    if (isVisible && props.vmId) {
      await refresh();

      if (vmData.value) {
        // 概要タブ
        tabRefs.value[0]?.resetForm({
          values: { name: vmData.value.name, nodeId: vmData.value.node.id },
        });

        // 構成タブ
        tabRefs.value[1]?.resetForm({
          values: {
            cpuCores: vmData.value.instanceType.cpuCores,
            memorySize:
              vmData.value.instanceType.memorySize / 1024 / 1024 / 1024,
            storages: vmData.value.attachedStorages.map((s, index) => ({
              id: s.storage.id,
              name: s.storage.name,
              size: s.storage.size / 1024 / 1024 / 1024,
              poolId: s.storage.pool, // ★ poolId に修正
              type: s.path === "/dev/sda" ? "os" : "manual", // pathを見てOSディスクを判断
            })),
          },
        });

        // ネットワークタブ
        tabRefs.value[2]?.resetForm({
          values: {
            subnetId: vmData.value.attachedNics[0]?.subnetId,
            securityGroupIds: vmData.value.securityGroups.map((sg) => sg.id),
          },
        });
      }
    }
  }
);
</script>
