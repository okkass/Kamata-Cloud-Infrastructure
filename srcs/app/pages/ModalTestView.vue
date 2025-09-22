<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">モーダル表示テストページ</h1>

    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
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
      <button @click="openModal('imageEdit')" class="btn-primary">
        イメージ編集
      </button>
      <button @click="openModal('instanceTypeAdd')" class="btn-primary">
        タイプ追加
      </button>
      <button @click="openModal('instanceTypeEdit')" class="btn-primary">
        タイプ編集
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
    <MoImageEdit
      :show="activeModal === 'imageEdit'"
      :image-data="dummyImageData"
      @close="closeModal"
    />
    <MoInstanceTypeAdd
      :show="activeModal === 'instanceTypeAdd'"
      @close="closeModal"
    />
    <MoInstanceTypeEdit
      :show="activeModal === 'instanceTypeEdit'"
      :instance-type-data="dummyInstanceTypeData"
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
// ==============================================================================
import MoVirtualMachineCreate from "~/components/MoVirtualMachineCreate.vue";
import MoVirtualMachineEdit from "~/components/MoVirtualMachineEdit.vue";
import MoAddNodeToCluster from "~/components/MoAddNodeToCluster.vue";
import MoImageEdit from "~/components/MoImageEdit.vue";
import MoInstanceTypeAdd from "~/components/MoInstanceTypeAdd.vue"; // ★★★ インポートを追加 ★★★
import MoInstanceTypeEdit from "~/components/MoInstanceTypeEdit.vue"; // ★★★ インポートを追加 ★★★
import BaseModal from "~/components/BaseModal.vue";
import AddLocalStorageForm from "~/components/MoLocalStorageAdd.vue";
import CreateVirtualNetworkForm from "~/components/MoVirtualNetworkCreate.vue";
import MoVirtualNetworkEdit from "~/components/MoVirtualNetworkEdit.vue";

// ==============================================================================
// リアクティブな状態変数 (State)
// ==============================================================================
const activeModal = ref(null);
const baseModalTitle = ref("");
const baseModalContent = shallowRef(null);

// ==============================================================================
// ダミーデータ (Dummy Data for Props)
// ==============================================================================
const dummyVmEditData = {
  /* ... */
};
const dummyNodeData = [
  /* ... */
];
const dummyImageData = {
  /* ... */
};

// ★★★ インスタンスタイプ編集モーダル用のダミーデータを追加 ★★★
const dummyInstanceTypeData = {
  id: "itype-001",
  name: "standard.medium",
  vcpus: 4,
  memory: 8,
  storage: 100,
};

// ==============================================================================
// 関数 (Methods)
// ==============================================================================
/**
 * モーダルを開く関数
 * @param {string} modalName - 開きたいモーダルの識別子
 */
const openModal = (modalName) => {
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
