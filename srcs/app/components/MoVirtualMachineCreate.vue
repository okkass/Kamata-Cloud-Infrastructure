<template>
  <BaseModal :show="show" :title="modalTitle" @close="$emit('close')">
    <div class="flex flex-col">
      <div class="flex border-b border-gray-200">
        <button
          v-for="(tab, index) in tabs"
          :key="tab.name"
          @click="currentTab = index"
          :class="[
            'py-2 px-4 text-sm font-medium',
            currentTab === index
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700',
          ]"
        >
          {{ tab.name }}
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
        class="flex justify-between items-center mt-6 pt-4 border-t border-gray-200"
      >
        <SecondaryButton @click="$emit('close')"> キャンセル </SecondaryButton>
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
import { ref, markRaw } from "vue";
import { useToast } from "~/composables/useToast";
import { useResourceCreate } from "~/composables/useResourceCreate";

// ==============================================================================
// 型定義 (API仕様に合わせて更新)
// ==============================================================================
interface StoragePayload {
  name: string;
  size: number; // バイト単位
  poolId: string;
  backupId?: string | null; // バックアップはオプショナル
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

// --- 親コンポーネントとの連携 ---
defineProps({
  show: { type: Boolean, required: true },
});
const emit = defineEmits(["close", "success"]);

// --- タブとUIの状態管理 (変更なし) ---
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

// --- API連携 ---
const { executeCreate, isCreating } = useResourceCreate<
  VirtualMachineCreateRequestDTO,
  ModelVirtualMachineDTO
>("virtual-machine");
const { addToast } = useToast();

/**
 * ファイルオブジェクトをテキストとして読み込むヘルパー関数
 */
const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

/**
 * 「作成」ボタンが押されたときに実行される関数
 */
const handleSubmit = async () => {
  // 1. 各タブからデータを集約
  const generalData = tabRefs.value[0]?.formData;
  const configData = tabRefs.value[1]?.formData;
  const osData = tabRefs.value[2]?.formData;
  const networkData = tabRefs.value[3]?.formData;

  // 2. APIに送信するペイロードを作成
  const payload: VirtualMachineCreateRequestDTO = {
    name: generalData?.name,
    instanceTypeId: configData?.templateId,
    subnetId: networkData?.networkId,
    publicKey: networkData?.keyPairFile
      ? await readFileAsText(networkData.keyPairFile)
      : null,
    imageId: osData?.osImageId,
    middleWareId: osData?.middlewareId,
    storages: configData?.storages.map((storage) => ({
      name: storage.name,
      size: storage.size * 1024 * 1024 * 1024, // GBをバイトに変換
      poolId: storage.poolId,
      // OSディスクにバックアップIDを紐付ける例
      backupId: storage.type === "os" ? configData.backupId : null,
    })),
    securityGroupIds: networkData?.securityGroupId
      ? [networkData.securityGroupId]
      : [],
  };

  // 3. executeCreate を使ってAPIに送信
  const result = await executeCreate(payload);

  if (result.success) {
    addToast({
      type: "success",
      message: `仮想マシン「${result.data?.name}」が作成されました`,
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
/* (スタイルは変更なし) */
.btn-primary {
  @apply py-2 px-5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700;
}
</style>
