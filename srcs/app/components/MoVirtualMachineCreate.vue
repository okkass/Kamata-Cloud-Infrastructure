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
        <keep-alive>
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
        </keep-alive>
      </div>

      <div
        class="flex justify-between items-center mt-6 pt-4 border-t border-gray-200"
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
            @click="createVirtualMachine"
            class="py-2 px-5 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700"
          >
            作成
          </button>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, markRaw } from "vue";
import { useToast } from "~/composables/useToast";

// ==============================================================================
// 担当者（API実装担当）へのメッセージ:
// このコンポーネントは、複数のタブコンポーネントから入力データを集約し、
// 最終的にAPIへ送信する役割を担います。
// 下記のcreateVirtualMachine関数内に、APIへのデータ送信ロジックを実装してください。
// ==============================================================================

// --- 親コンポーネントとの連携定義 (変更不要) ---
defineProps({
  show: { type: Boolean, required: true },
});
const emit = defineEmits(["close", "create"]);

// --- タブとUIの状態管理 (変更不要) ---
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
const tabRefs = ref([]); // 各タブコンポーネントへの参照を保持する配列
const currentTab = ref(0);
const modalTitle = ref("仮想マシン作成");
const { addToast } = useToast();

// --- UI操作のロジック (変更不要) ---
const prevTab = () => {
  if (currentTab.value > 0) currentTab.value--;
};
const nextTab = () => {
  if (currentTab.value < tabs.length - 1) currentTab.value++;
};

/**
 * 「作成」ボタンが押されたときに実行される関数
 */
const createVirtualMachine = () => {
  // ============================================================================
  // ▼▼▼ API実装担当者の方へ: この中にAPI呼び出し処理を実装してください ▼▼▼
  // ============================================================================

  // 1. 各タブからのデータ集約:
  //    各タブコンポーネントは、自身の入力データを `defineExpose({ formData })` を使って
  //    公開することが想定されています。
  //    tabRefs 配列から各コンポーネントのデータを取得し、一つのオブジェクトにまとめます。
  const generalData = tabRefs.value[0]?.formData || {};
  const configData = tabRefs.value[1]?.formData || {};
  const osData = tabRefs.value[2]?.formData || {};
  const networkData = tabRefs.value[3]?.formData || {};

  // 2. ペイロードの作成:
  //    集約したデータを、APIが要求する形式のペイロードに整形します。
  //    単位変換(GB->バイトなど)もここで行います。
  const payload = {
    ...generalData,
    ...configData,
    ...osData,
    ...networkData,
    // 例: configData.memorySize を memorySizeInBytes に変換
    // memorySize: (configData.memorySize || 0) * 1024 * 1024 * 1024,
  };

  // 3. API呼び出し (POSTリクエスト):
  //    const { data, error } = await useApiFetch('/virtual-machines', {
  //      method: 'POST',
  //      body: payload,
  //    });

  // 4. 結果のハンドリング:
  //    if (error.value) {
  //      addToast({ message: '仮想マシンの作成に失敗しました。', type: 'error' });
  //    } else {
  //      addToast({ message: `仮想マシン「${payload.vmName}」を作成しました。`, type: 'success' });
  //      emit('create', data.value);
  //      emit('close');
  //    }

  // --- 現在はAPI実装前のダミー動作 ---
  console.log("APIに送信するデータ:", payload);
  addToast({
    message: `【ダミー】仮想マシン「${payload.vmName}」を作成しました。`,
    type: "success",
  });
  emit("create", { ...payload, id: "vm-dummy-id" }); // ダミーのIDを付与して通知
  emit("close");
  // ============================================================================
  // ▲▲▲ API実装はここまで ▲▲▲
  // ============================================================================
};
</script>

<style scoped>
.btn-primary {
  @apply py-2 px-5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700;
}
</style>
