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
              ? 'border-b-2 border-blue-500 text-blue-600' // アクティブなタブ
              : 'text-gray-500 hover:text-gray-700', // 非アクティブなタブ
          ]"
        >
          {{ tab.name }}
        </button>
      </div>

      <div class="pt-6">
        <keep-alive>
          <component :is="tabs[currentTab].component" />
        </keep-alive>
      </div>

      <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
        <button
          @click="prevTab"
          :disabled="currentTab === 0"
          class="py-2 px-5 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          戻る
        </button>
        <button
          v-if="currentTab < tabs.length - 1"
          @click="nextTab"
          class="py-2 px-5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700"
        >
          次へ
        </button>
        <button
          v-else
          @click="createVirtualMachine"
          class="py-2 px-5 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700"
        >
          確定
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, markRaw } from "vue";

// --- 親コンポーネントとの連携 ---
defineProps({
  show: { type: Boolean, required: true },
});
const emit = defineEmits(["close"]);

// --- ここからがこのコンポーネントのロジック ---

// 1. 各タブの情報を定義
import VmEditTabGeneral from "~/components/vm-edit-tabs/VmEditTabGeneral.vue";
import VmEditTabConfig from "~/components/vm-edit-tabs/VmEditTabConfig.vue";
import VmEditTabNetwork from "~/components/vm-edit-tabs/VmEditTabNetwork.vue";

const tabs = [
  { name: "概要", component: markRaw(TabGeneral) },
  { name: "構成", component: markRaw(TabConfig) },
  { name: "ネットワーク/セキュリティグループ", component: markRaw(TabNetwork) },
];

// 2. 現在アクティブなタブを管理 (0から始まるインデックス)
const currentTab = ref(0);
const modalTitle = ref("仮想マシン編集");

// 3. ナビゲーション関数
const prevTab = () => {
  if (currentTab.value > 0) {
    currentTab.value--;
  }
};
const nextTab = () => {
  if (currentTab.value < tabs.length - 1) {
    currentTab.value++;
  }
};

// 4. 作成処理
const createVirtualMachine = () => {
  alert("編集を確定します！");
  emit("close");
};
</script>
