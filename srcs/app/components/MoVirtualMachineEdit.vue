<template>
  <BaseModal :show="show" :title="modalTitle" @close="$emit('close')" size="lg">
    <div class="flex flex-col">
      <div v-if="pending" class="text-center p-8">
        仮想マシンの情報を読み込み中...
      </div>

      <div v-else-if="error" class="text-center text-red-500 p-8">
        <p>情報の読み込みに失敗しました。</p>
        <p class="text-sm mt-2">
          {{ error.message || (error as any).statusMessage }}
        </p>
        <button @click="reloadData" class="btn-secondary mt-4">再試行</button>
      </div>

      <div v-else-if="vmData" class="flex flex-col">
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
              v-if="!isValid(index)"
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
            :ref="setTabRef(index)"
            :initial-data="getInitialDataForTab(index)"
            :vm-data="vmData"
          />
        </div>

        <div
          class="flex justify-end items-center mt-6 pt-4 border-t border-gray-200"
        >
          <div v-if="submitError" class="text-sm text-red-500 mr-4">
            {{ submitError }}
          </div>

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
              @click="handleSubmitProxy"
              :disabled="isSubmitting"
              class="py-2 px-5 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 disabled:opacity-50"
            >
              {{ isSubmitting ? "更新中..." : "更新" }}
            </button>
          </div>
        </div>
      </div>

      <div v-else class="text-center text-gray-500 p-8">
        仮想マシンデータを待機中...
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
// (BaseModal, SecondaryButton 等のUIコンポーネントはインポート済みと仮定)
// import BaseModal from '~/components/ui/BaseModal.vue';
// import SecondaryButton from '~/components/ui/SecondaryButton.vue';

// Composable をインポート
import { useVirtualMachineEdit } from "~/composables/modal/useVirtualMachineEdit";

// --- Props & Emits ---
const props = defineProps({
  /** モーダルの表示状態 */
  show: { type: Boolean, required: true },
  /** 編集対象の仮想マシンID */
  vmId: { type: String, default: null },
});
const emit = defineEmits(["close", "success"]);

// --- Composable のセットアップ ---
// Composable を呼び出し、必要な state と関数をすべて受け取る
const {
  // データ取得
  vmData,
  pending,
  error,
  reloadData,
  // タブ管理
  tabs,
  currentTab,
  modalTitle,
  prevTab,
  nextTab,
  setTabRef,
  isValid,
  // 更新処理
  handleSubmit,
  isSubmitting,
  submitError,
  // 初期値提供
  getInitialDataForTab,
} = useVirtualMachineEdit(props); // props を渡す

// --- handleSubmit のプロキシ ---
// Composable の handleSubmit は emit を引数に取るため、
// テンプレートから直接呼び出しやすいようにラップする
const handleSubmitProxy = () => {
  handleSubmit((event: "success" | "close") => {
    emit(event);
  });
};

// (コンポーネント内のロジックは Composable に集約されたため、これ以上不要です)
</script>
