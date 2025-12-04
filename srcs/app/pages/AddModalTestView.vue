<template>
  <div class="p-8 space-y-8">
    <div>
      <h1 class="text-2xl font-bold mb-4">作成・追加モーダル テストページ</h1>
      <p class="text-gray-600">
        各ボタンをクリックして、作成 (Create) / 追加 (Add)
        系のモーダルの見た目と基本的な動作を確認します。
      </p>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
      <button
        v-for="modal in createAddModals"
        :key="modal.id"
        @click="openModal(modal.id)"
        class="btn btn-primary"
      >
        {{ modal.buttonText }}
      </button>
    </div>

    <component
      v-for="modal in createAddModals"
      :key="modal.id"
      :is="modal.component"
      :show="activeModal === modal.id"
      v-bind="modal.props"
      @close="closeModal"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * 作成・追加モーダル テストページ
 * ---------------------------------------------------------------------------------
 * このページは、アプリケーション内で使用される「作成 (Create)」および「追加 (Add)」系の
 * モーダルコンポーネントの表示と基本的な動作を確認するために使用されます。
 * =================================================================================
 */
import { ref, markRaw, computed } from "vue";

// ==============================================================================
// コンポーネントインポート (Create/Add系のみ)
// ==============================================================================
import MoVirtualMachineCreate from "~/components/MoVirtualMachineCreate.vue";
import MoAddNodeToCluster from "~/components/MoAddNodeToCluster.vue";
import MoImageAdd from "~/components/MoImageAdd.vue";
import MoInstanceTypeAdd from "~/components/MoInstanceTypeAdd.vue";
import MoSecurityGroupCreate from "~/components/MoSecurityGroupCreate.vue";
import MoUserAdd from "~/components/MoUserAdd.vue";
import MoVirtualNetworkCreate from "~/components/MoVirtualNetworkCreate.vue";
import MoLocalStorageAdd from "~/components/MoStorageAdd.vue";
import MoBackupCreate from "~/components/MoBackupCreate.vue";
import MoSnapshotCreate from "~/components/MoSnapshotCreate.vue";

// ==============================================================================
// State (状態管理)
// ==============================================================================
// 現在アクティブなモーダルのIDを保持します (nullの場合は非表示)
const activeModal = ref<string | null>(null);

// ==============================================================================
// モーダル定義 (Create/Add系のみ)
// ==============================================================================
// 表示するモーダルとその設定を定義します
const createAddModals = computed(() => [
  {
    id: "vmCreate",
    buttonText: "VM作成",
    component: markRaw(MoVirtualMachineCreate),
    props: {}, // Create系モーダルは通常Props不要
  },
  {
    id: "netCreate",
    buttonText: "NW作成",
    component: markRaw(MoVirtualNetworkCreate),
    props: {},
  },
  {
    id: "storageAdd",
    buttonText: "ストレージ追加",
    component: markRaw(MoStorageAdd),
    // props: { nodes: [], availableDisks: [] }, // 必要に応じてAPI連携
    props: {}, // ダミーデータ削除
  },
  {
    id: "nodeAdd",
    buttonText: "クラスターにノード追加",
    component: markRaw(MoAddNodeToCluster),
    // props: { nodes: [] }, // 必要に応じてAPI連携
    props: {}, // ダミーデータ削除
  },
  {
    id: "imageAdd",
    buttonText: "イメージ追加",
    component: markRaw(MoImageAdd),
    props: {},
  },
  {
    id: "instanceTypeAdd",
    buttonText: "タイプ追加",
    component: markRaw(MoInstanceTypeAdd),
    props: {},
  },
  {
    id: "sgCreate",
    buttonText: "SG作成",
    component: markRaw(MoSecurityGroupCreate),
    props: {},
  },
  {
    id: "userAdd",
    buttonText: "利用者追加",
    component: markRaw(MoUserAdd),
    props: {},
  },
  {
    id: "backupCreate",
    buttonText: "BU作成",
    component: markRaw(MoBackupCreate),
    props: {},
  },
  {
    id: "snapshotCreate",
    buttonText: "SS作成",
    component: markRaw(MoSnapshotCreate),
    props: {},
  },
  // --- Edit系のモーダル定義は削除 ---
]);

// ==============================================================================
// Methods (メソッド)
// ==============================================================================
/**
 * 指定されたIDのモーダルを開きます。
 * @param modalId 開きたいモーダルのID
 */
const openModal = (modalId: string) => {
  activeModal.value = modalId;
};

/**
 * 現在開いているモーダルを閉じます。
 */
const closeModal = () => {
  activeModal.value = null;
};

/**
 * モーダルでの操作が成功したときに呼ばれるハンドラ。
 * モーダルを閉じます。(一覧更新などの処理は削除)
 */
const handleSuccess = () => {
  closeModal();
  // refresh(); // VM一覧の再取得処理は不要なため削除
};
</script>
