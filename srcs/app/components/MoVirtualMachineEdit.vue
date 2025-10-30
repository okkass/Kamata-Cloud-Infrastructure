<template>
  <BaseModal :show="show" :title="modalTitle" @close="handleClose" size="lg">
    <div class="flex flex-col">
      <div v-if="pending && !vmData" class="text-center p-8 text-gray-500">
        <p>仮想マシンの情報を読み込み中...</p>
      </div>

      <div v-else-if="error" class="text-center text-red-500 p-8">
        <p>情報の読み込みに失敗しました。</p>
        <p class="text-sm mt-1">{{ error.message }}</p>
        <button @click="reloadData" class="btn-secondary mt-4">再試行</button>
      </div>

      <div v-else-if="vmData">
        <div class="flex border-b border-gray-200">
          <button
            type="button"
            v-for="(tab, index) in tabs"
            :key="tab.name"
            @click="currentTab = index"
            :class="[
              'relative py-2 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400',
              currentTab === index
                ? 'border-b-2 border-blue-500 text-blue-600' // アクティブタブ
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:border-b-2', // 非アクティブタブ
            ]"
            :aria-current="currentTab === index ? 'page' : undefined"
          >
            {{ tab.name }}
            <span
              v-if="!isValid(index)"
              class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
              title="このタブに入力エラーがあります"
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
          />
        </div>

        <div class="modal-footer mt-6 pt-4 border-t border-gray-200">
          <p v-if="submitError" class="text-sm text-red-500 mr-auto">
            {{ submitError }}
          </p>

          <div class="flex gap-3">
            <button
              type="button"
              @click="prevTab"
              :disabled="currentTab === 0"
              class="btn-secondary"
            >
              戻る
            </button>
            <button
              type="button"
              @click="handleNextOrSubmit"
              :disabled="isSubmitting"
              :class="
                currentTab === tabs.length - 1 ? 'btn-success' : 'btn-primary'
              "
            >
              <svg
                v-if="isSubmitting && currentTab === tabs.length - 1"
                class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                ></path>
              </svg>
              {{
                currentTab < tabs.length - 1
                  ? "次へ"
                  : isSubmitting
                  ? "更新中..."
                  : "更新"
              }}
            </button>
          </div>
        </div>
      </div>
      <div
        v-else-if="!pending && !error && !vmData"
        class="text-center p-8 text-gray-500"
      >
        仮想マシンのデータが見つかりませんでした。
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * 仮想マシン編集モーダル (MoVirtualMachineEdit.vue)
 * ---------------------------------------------------------------------------------
 * 既存の仮想マシンの設定を複数のタブに分けて編集するためのモーダルUIです。
 * データ取得、タブ管理、フォームの初期化、更新処理は `useVirtualMachineEdit`
 * Composable に委譲します。
 * =================================================================================
 */
import { ref, computed } from "vue"; // markRaw は Composable へ移動
// Composable をインポート (後で作成)
import { useVirtualMachineEdit } from "~/composables/modal/useVirtualMachineEdit";
// 各タブのコンポーネントをインポート (Composable でもインポートするが、型推論のためにここでも記述)
import type VmEditTabGeneral from "~/components/vm-edit-tabs/VmEditTabGeneral.vue";
import type VmEditTabConfig from "~/components/vm-edit-tabs/VmEditTabConfig.vue";
import type VmEditTabNetwork from "~/components/vm-edit-tabs/VmEditTabNetwork.vue";
// 共通ボタンコンポーネント (もし SecondaryButton があれば)
// import SecondaryButton from '~/components/SecondaryButton.vue';

// --- Props (親コンポーネントからの受け取りデータ) ---
const props = defineProps({
  /** モーダルの表示状態 (v-model:show) */
  show: { type: Boolean, required: true },
  /** 編集対象の仮想マシンのID */
  vmId: { type: String, default: null },
});

// --- Emits (親コンポーネントへのイベント通知) ---
const emit = defineEmits([
  "close", // モーダルを閉じる要求
  "success", // 更新成功通知
]);

// --- Composable からロジックと状態を取得 ---
const {
  // データ取得関連
  vmData, // 取得したVMの詳細データ (ref)
  pending, // データ取得中フラグ (ref)
  error, // データ取得エラー (ref)
  reloadData, // データ再取得関数

  // タブ関連
  tabs, // タブ定義の配列 (ref or computed)
  currentTab, // 現在アクティブなタブのインデックス (ref)
  modalTitle, // モーダルのタイトル (ref or computed)
  prevTab, // 前のタブへ移動する関数
  nextTab, // 次のタブへ移動する関数
  setTabRef, // タブコンポーネントの参照を設定する関数
  isValid, // 指定されたタブが有効かチェックする関数

  // 更新処理関連
  handleSubmit, // 更新処理を実行する関数
  isSubmitting, // 更新API通信中フラグ (ref)
  submitError, // 更新時のエラーメッセージ (ref)
} = useVirtualMachineEdit(props); // Props (特に vmId) を Composable に渡す

// --- ローカルメソッド ---
/**
 * モーダルを閉じる処理
 */
const handleClose = () => {
  // 必要であれば閉じる前の確認処理などをここに書く
  emit("close");
};

/**
 * 「次へ」または「更新」ボタンが押されたときの処理
 */
const handleNextOrSubmit = () => {
  if (currentTab.value < tabs.value.length - 1) {
    nextTab(); // 最後のタブでなければ次に進む
  } else {
    handleSubmit(emit); // 最後のタブなら更新処理を実行 (emitを渡す)
  }
};
</script>
