<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">モーダル表示テストページ</h1>

    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <button @click="openModal('vmCreate')" class="btn-primary">VM作成</button>
      <button @click="openModal('vmEdit')" class="btn-primary">VM編集</button>
      <button @click="openModal('netCreate')" class="btn-primary">
        NW作成
      </button>
      <button @click="openModal('netEdit')" class="btn-primary">NW編集</button>
      <button @click="openModal('storageAdd')" class="btn-primary">
        ストレージ追加
      </button>
      <button @click="openModal('nodeAdd')" class="btn-primary">
        ノード追加
      </button>
    </div>

    <MoVirtualMachineCreate
      :show="activeModal === 'vmCreate'"
      @close="closeModal"
    />
    <MoVirtualMachineEdit
      :show="activeModal === 'vmEdit'"
      :vm-data="dummyVmEditData"
      @close="closeModal"
    />
    <MoAddNodeToCluster
      :show="activeModal === 'nodeAdd'"
      :nodes="dummyNodeData"
      @close="closeModal"
    />

    <BaseModal
      :show="['netCreate', 'netEdit', 'storageAdd'].includes(activeModal)"
      :title="baseModalTitle"
      @close="closeModal"
    >
      <component :is="baseModalContent" @close="closeModal" />
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, shallowRef, markRaw } from "vue";

// ==============================================================================
// コンポーネントのインポート
// 命名規則に従い、PascalCaseで記述
// ==============================================================================
// --- モーダルコンポーネントのインポート ---
import MoVirtualMachineCreate from "~/components/MoVirtualMachineCreate.vue";
import MoVirtualMachineEdit from "~/components/MoVirtualMachineEdit.vue";
import BaseModal from "~/components/BaseModal.vue";
import AddLocalStorageForm from "~/components/MoLocalStorageAdd.vue";
import CreateVirtualNetworkForm from "~/components/MoVirtualNetworkCreate.vue";
import MoVirtualNetworkEdit from "~/components/MoVirtualNetworkEdit.vue";
import MoAddNodeToCluster from "~/components/MoAddNodeToCluster.vue";

// ==============================================================================
// リアクティブな状態変数 (State)
// ==============================================================================
// どのモーダルが開いているかを管理 (nullは全て閉じている状態)
const activeModal = ref(null);

// BaseModalで動的に中身を切り替えるための変数
const baseModalTitle = ref("");
const baseModalContent = shallowRef(null);

// ==============================================================================
// ダミーデータ (Dummy Data for Props)
// APIが完成するまでのテスト用データ
// ==============================================================================
// VM編集モーダル用のデータ
const dummyVmEditData = {
  general: { vmName: "test-vm-01", node: "node2" },
  config: {
    cpu: 8,
    memory: 8192,
    storage: [{ id: 1, name: "OS", size: 100, pool: "Pool-1", type: "os" }],
  },
  network: {
    network: "teacher-net",
    subnet: "172.16.0.0/24",
    securityGroups: [],
  },
};

// ノード追加モーダル用のデータ
const dummyNodeData = [
  { id: "node-x", name: "Node-X", ipAddress: "192.168.1.101" },
  { id: "node-y", name: "Node-Y", ipAddress: "192.168.1.102" },
  { id: "node-z", name: "Node-Z", ipAddress: "192.168.1.103" },
];

// ==============================================================================
// 関数 (Methods)
// ==============================================================================
/**
 * モーダルを開く関数
 * @param {string} modalName - 開きたいモーダルの識別子
 */
const openModal = (modalName) => {
  // BaseModalを使用するモーダルの場合は、タイトルと中身のコンポーネントをセット
  const simpleModals = {
    netCreate: {
      title: "仮想ネットワーク作成",
      component: CreateVirtualNetworkForm,
    },
    netEdit: { title: "仮想ネットワーク編集", component: MoVirtualNetworkEdit },
    storageAdd: {
      title: "ローカルストレージ追加",
      component: AddLocalStorageForm,
    },
  };

  if (simpleModals[modalName]) {
    baseModalTitle.value = simpleModals[modalName].title;
    baseModalContent.value = markRaw(simpleModals[modalName].component);
  }

  activeModal.value = modalName;
};

/**
 * すべてのモーダルを閉じる関数
 */
const closeModal = () => {
  activeModal.value = null;
};
</script>

<style scoped>
.btn-primary {
  @apply py-2 px-5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700;
}
</style>
