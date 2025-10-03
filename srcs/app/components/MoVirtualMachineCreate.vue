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
import { useToast } from "~/composables/useToast";
import { useResourceCreate } from "~/composables/useResourceCreate";

// (型定義は変更なし)
interface StoragePayload {
  name: string;
  size: number;
  poolId: string;
  backupId?: string | null;
}
interface VirtualMachineCreateRequestDTO {
  name: string;
  instanceTypeId: string | null;
  subnetId: string | null;
  publicKey: string | null;
  imageId: string | null;
  middleWareId?: string | null;
  storages: StoragePayload[];
  securityGroupIds: string[];
}
interface ModelVirtualMachineDTO {
  id: string;
  name: string;
}

// (Props, Emits, タブ定義などは変更なし)
defineProps({ show: { type: Boolean, required: true } });
const emit = defineEmits(["close", "success"]);
import TabGeneral from "~/components/vm-tabs/TabGeneral.vue";
import TabConfig from "~/components/vm-tabs/TabConfig.vue";
import TabOsMiddleware from "~/components/vm-tabs/TabOsMiddleware.vue";
import TabNetwork from "~/components/vm-tabs/TabNetwork.vue";
const tabs = [
  { name: "概要", component: markRaw(TabGeneral) },
  { name: "構成", component: markRaw(TabConfig) },
  { name: "OS/ミドルウェア", component: markRaw(TabOsMiddleware) },
  { name: "ネットワーク/セキュリティグループ", component: markRaw(TabNetwork) },
];
const tabRefs = ref<any[]>([]);
const currentTab = ref(0);
const modalTitle = ref("仮想マシン作成");
const prevTab = () => {
  if (currentTab.value > 0) currentTab.value--;
};
const nextTab = () => {
  if (currentTab.value < tabs.length - 1) currentTab.value++;
};
const tabValidity = computed(() => {
  return tabRefs.value.map((tab) => tab?.isValid?.valid ?? false);
});

// (API連携セットアップ)
const { executeCreate, isCreating } = useResourceCreate<
  VirtualMachineCreateRequestDTO,
  ModelVirtualMachineDTO
>("virtual-machine");
const { addToast } = useToast();

//　公開鍵ファイル読み込み処理
const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsText(file);
  });
};

/**
 * 「作成」ボタンが押されたときに実行される関数
 */
const handleSubmit = async () => {
  // (バリデーションチェック)
  const invalidTabs = tabRefs.value.reduce((acc, tab, index) => {
    if (!tab?.isValid?.valid) {
      acc.push(tabs[index].name);
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
    currentTab.value = firstInvalidIndex;
    return;
  }

  // (データ集約は変更なし)
  const generalData = tabRefs.value[0]?.formData;
  const configData = tabRefs.value[1]?.formData;
  const osData = tabRefs.value[2]?.formData;
  const networkData = tabRefs.value[3]?.formData;

  const payload: VirtualMachineCreateRequestDTO = {
    name: generalData?.name,
    instanceTypeId: configData?.templateId,
    subnetId: networkData?.networkId,
    publicKey: networkData?.keyPairFile
      ? await readFileAsText(networkData.keyPairFile)
      : null,
    imageId: osData?.osImageId,
    middleWareId: osData?.middlewareId,
    storages: configData?.storages.map((storage: any) => ({
      name: storage.name,
      size: storage.size * 1024 * 1024 * 1024,
      poolId: storage.poolId,
      backupId: storage.type === "os" ? configData.backupId : null,
    })),
    securityGroupIds: networkData?.securityGroupId
      ? [networkData.securityGroupId]
      : [],
  };

  const result = await executeCreate(payload);

  if (result.success) {
    addToast({
      type: "success",
      message: `仮想マシン「${payload.name}」が作成されました`,
    });
    emit("success");
    // ★★★ ここを追加: モーダルを閉じるイベントを通知 ★★★
    emit("close");
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
/* (スタイルは変更なし) */
.btn-primary {
  @apply py-2 px-5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700;
}
</style>
