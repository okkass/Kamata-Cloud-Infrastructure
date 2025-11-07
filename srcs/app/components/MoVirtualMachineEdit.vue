<template>
  <BaseModal>
    <div class="flex flex-col">
      <div v-if="pending" class="text-center p-8">
        仮想マシンの情報を読み込み中...
      </div>

      <div v-else-if="error" class="text-center text-red-500 p-8">
        情報の読み込みに失敗しました。
        <button @click="reloadData">再試行</button>
      </div>

      <div v-else-if="vmData" class="flex flex-col">
        <div class="flex border-b ..."></div>

        <div class="pt-6">
          <component
            v-for="(tab, index) in tabs"
            :key="tab.name"
            v-show="currentTab === index"
            :is="tab.component"
            :ref="setTabRef(index)"
            :initial-data="getInitialDataForTab(index)"
          />
        </div>

        <div class="flex justify-end ..."></div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { useVirtualMachineEdit } from "~/composables/modal/useVirtualMachineEdit";

const props = defineProps<{
  show: boolean;
  vmId: string | null;
}>();
const emit = defineEmits(["close", "success"]);

// Composable から必要なものをすべて受け取る
const {
  vmData, // ★ v-else-if="vmData" で使う
  pending, // ★ v-if="pending" で使う
  error, // ★ v-else-if="error" で使う
  reloadData,
  tabs,
  currentTab,
  modalTitle,
  prevTab,
  nextTab,
  setTabRef,
  isValid,
  handleSubmit,
  isSubmitting,
  submitError,
  getInitialDataForTab, // ★ :initial-data で使う
} = useVirtualMachineEdit(props);

// (handleSubmitProxy の定義 ...)
const handleSubmitProxy = () => {
  handleSubmit((event) => emit(event));
};
</script>

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
