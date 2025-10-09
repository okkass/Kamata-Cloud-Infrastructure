<template>
  <BaseModal :show="show" :title="modalTitle" @close="$emit('close')" size="lg">
    <div class="flex flex-col">
      <div class="flex border-b border-gray-200">
        <button
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
            title="このタブに入力エラーがあります"
          ></span>
        </button>
      </div>

      <div class="pt-6 min-h-[300px]">
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
            v-if="currentTab < tabs.length - 1"
            @click="nextTab"
            class="btn-primary"
          >
            次へ
          </button>
          <button
            v-else
            @click="handleSubmit"
            :disabled="isCreating"
            class="py-2 px-5 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 disabled:opacity-50"
          >
            {{ isCreating ? "作成中..." : "作成" }}
          </button>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, markRaw, computed } from "vue";
import TabGeneral from "~/components/vm-tabs/TabGeneral.vue";
import TabConfig from "~/components/vm-tabs/TabConfig.vue";
import TabOsMiddleware from "~/components/vm-tabs/TabOsMiddleware.vue";
import TabNetwork from "~/components/vm-tabs/TabNetwork.vue";

// --- defineProps & defineEmits ---
defineProps({ show: { type: Boolean, required: true } });
const emit = defineEmits(["close", "success"]);

// --- State ---
const currentTab = ref(0);
const modalTitle = ref("仮想マシン作成");
const tabRefs = ref<any[]>([]);
const tabs = [
  { name: "概要", component: markRaw(TabGeneral) },
  { name: "構成", component: markRaw(TabConfig) },
  { name: "OS/ミドルウェア", component: markRaw(TabOsMiddleware) },
  { name: "ネットワーク/セキュリティ", component: markRaw(TabNetwork) },
];

// --- Composables ---
const { executeCreate, isCreating } = useResourceCreate<
  VirtualMachineCreateRequestDTO,
  VirtualMachineDTO
>("virtual-machine");
const { addToast } = useToast();

// --- Computed ---
const tabValidity = computed(() => {
  return tabRefs.value.map((tab) => tab?.isValid?.valid ?? false); // デフォルトをfalseに
});

// --- Methods ---
const prevTab = () => {
  if (currentTab.value > 0) currentTab.value--;
};
const nextTab = () => {
  if (currentTab.value < tabs.length - 1) currentTab.value++;
};

const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

const handleSubmit = async () => {
  const invalidTabs = tabRefs.value.reduce((acc, tab, index) => {
    if (!tab?.isValid?.valid) {
      if (tabs[index]) acc.push(tabs[index].name);
    }
    return acc;
  }, [] as string[]);

  if (invalidTabs.length > 0) {
    addToast({
      message: `「${invalidTabs.join("」「")}」タブに入力エラーがあります。`,
      type: "error",
    });
    const firstInvalidIndex = tabRefs.value.findIndex(
      (tab) => !tab?.isValid?.valid
    );
    if (firstInvalidIndex !== -1) currentTab.value = firstInvalidIndex;
    return;
  }

  const generalData = tabRefs.value[0]?.formData;
  const configData = tabRefs.value[1]?.formData;
  const osData = tabRefs.value[2]?.formData;
  const networkData = tabRefs.value[3]?.formData;

  const basePayload = {
    name: generalData?.name ?? "",
    nodeId: generalData?.nodeId ?? null,
    subnetId: networkData?.networkId ?? null,
    publicKey: networkData?.keyPairFile
      ? await readFileAsText(networkData.keyPairFile)
      : null,
    securityGroupIds: networkData?.securityGroupIds ?? [],
    imageId: osData?.osImageId ?? null,
    middleWareId: osData?.middlewareId,
    storages:
      configData?.storages.map((storage: any) => ({
        name: storage.name,
        size: convertUnitToByte(storage.size, "GB"),
        poolId: storage.poolId,
        backupId: storage.type === "backup" ? configData.backupId : null,
      })) ?? [],
  };

  let payload: VirtualMachineCreateRequestDTO;

  if (configData?.templateId) {
    // パターンA: インスタンスタイプIDがある場合
    payload = {
      ...basePayload,
      instanceTypeId: configData.templateId,
    };
  } else {
    // パターンB: CPUとメモリをカスタム指定する場合
    payload = {
      ...basePayload,
      cpuCores: configData?.cpuCores,
      memorySize: convertUnitToByte(configData?.memorySize, "MB"),
    };
  }

  const result = await executeCreate(payload);

  if (result.success) {
    addToast({
      type: "success",
      message: `仮想マシン「${payload.name}」が作成されました`,
    });
    emit("success");
  } else {
    addToast({
      type: "error",
      message: "仮想マシンの作成に失敗しました。",
      details: result.error?.message,
    });
  }
};
</script>

<style scoped>
.btn-primary {
  @apply py-2 px-5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700;
}
</style>
