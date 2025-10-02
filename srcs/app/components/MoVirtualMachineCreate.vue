<template>
  <BaseModal :show="show" :title="modalTitle" @close="$emit('close')">
    <form @submit.prevent="handleSubmit">
      <div class="flex flex-col">
        <div class="flex border-b border-gray-200">
          <button
            type="button"
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
              type="submit"
              :disabled="isCreating"
              class="py-2 px-5 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 disabled:opacity-50"
            >
              {{ isCreating ? "作成中..." : "作成" }}
            </button>
          </div>
        </div>
      </div>
    </form>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, markRaw } from "vue";
import { useToast } from "~/composables/useToast";
import { useResourceCreate } from "~/composables/useResourceCreate";

// --- 型定義 (本来は types/dto.ts などからインポート) ---
type VirtualMachineCreateRequestDTO = any;
type ModelVirtualMachineDTO = any;

// --- 親コンポーネントとの連携 ---
defineProps({
  show: { type: Boolean, required: true },
});
const emit = defineEmits(["close", "success"]);

// --- タブとUIの状態管理 ---
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

// --- UI操作のロジック ---
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
>("virtual-machines");
const { addToast } = useToast();

const handleSubmit = async () => {
  // (handleSubmit関数の内容は変更なし)
  const generalData = tabRefs.value[0]?.formData || {};
  const configData = tabRefs.value[1]?.formData || {};
  const osData = tabRefs.value[2]?.formData || {};
  const networkData = tabRefs.value[3]?.formData || {};

  const payload: VirtualMachineCreateRequestDTO = {
    ...generalData,
    ...configData,
    ...osData,
    ...networkData,
  };

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
