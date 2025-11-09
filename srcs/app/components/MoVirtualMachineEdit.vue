<template>
  <!-- 
    UIコンポーネント (BaseModal)
    Composable から受け取った modalTitle を :title にバインドします。
    @close イベントはそのまま emit します。
  -->
  <BaseModal :show="show" :title="modalTitle" @close="$emit('close')" size="lg">
    <div class="flex flex-col">
      <!-- 1. ローディング表示 (Composable の 'pending' を使用) -->
      <div v-if="pending" class="text-center p-8">
        仮想マシンの情報を読み込み中...
      </div>

      <!-- 2. エラー表示 (Composable の 'error' を使用) -->
      <div v-else-if="error" class="text-center text-red-500 p-8">
        <p>情報の読み込みに失敗しました。</p>
        <p class="text-sm mt-2">
          {{ error.message || (error as any).statusMessage }}
        </p>
        <!-- Composable の 'reloadData' を呼ぶ -->
        <button @click="reloadData" class="btn-secondary mt-4">再試行</button>
      </div>

      <!-- 
        3. ★★★ 成功時 (Composable の 'vmData' を使用) ★★★
        これが初期値が空になる問題の解決策です。
        'v-else-if="vmData"' により、データが null (取得前) の場合はタブを描画しません。
      -->
      <div v-else-if="vmData" class="flex flex-col">
        <!-- タブヘッダー (Composable の 'tabs', 'currentTab' を使用) -->
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
            <!-- Composable の 'isValid(index)' を使用 -->
            <span
              v-if="!isValid(index)"
              class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
            ></span>
          </button>
        </div>

        <!-- タブコンテンツ (v-show で表示を切り替え) -->
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

        <!-- フッター (Composable の関数を使用) -->
        <div
          class="flex justify-end items-center mt-6 pt-4 border-t border-gray-200"
        >
          <!-- API更新時のエラー表示 (Composable の 'submitError' を使用) -->
          <div v-if="submitError" class="text-sm text-red-500 mr-4">
            {{ submitError }}
          </div>

          <div class="flex gap-3">
            <!-- Composable の 'prevTab' を使用 -->
            <SecondaryButton @click="prevTab" :disabled="currentTab === 0">
              戻る
            </SecondaryButton>

            <!-- 'nextTab' を使用 -->
            <button
              type="button"
              v-if="currentTab < tabs.length - 1"
              @click="nextTab"
              class="btn-primary"
            >
              次へ
            </button>

            <!-- 'handleSubmitProxy' と 'isSubmitting' を使用 -->
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

      <!-- 4. v-else (vmData が null だが、pendingでもerrorでもない場合 = 初期状態) -->
      <div v-else class="text-center text-gray-500 p-8">
        仮想マシンデータを待機中...
      </div>
    </div>
  </BaseModal>
</template>

<!-- 
  ★★★ エラー解決 ★★★
  ファイル内に <script setup> は「一つだけ」にします。
  古い useFetch や watch(resetForm) のロジックはすべて削除し、
  useVirtualMachineEdit のみに依存します。
-->
<script setup lang="ts">
// (BaseModal, SecondaryButton 等のUIコンポーネントはインポート済みと仮定)
// import BaseModal from '~/components/ui/BaseModal.vue';
// import SecondaryButton from '~/components/ui/SecondaryButton.vue';

// ★ エラーのパス情報から Composable のパスを推定
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
} = useVirtualMachineEdit(props); // ★ props を渡す

// --- handleSubmit のプロキシ ---
// Composable の handleSubmit は emit を引数に取るため、
// テンプレートから直接呼び出しやすいようにラップする
const handleSubmitProxy = () => {
  // Composable の handleSubmit に、このコンポーネントの emit を渡す
  handleSubmit((event: "success" | "close") => {
    emit(event);
  });
};
</script>
