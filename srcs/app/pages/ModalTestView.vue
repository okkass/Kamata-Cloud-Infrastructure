<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">モーダル表示テストページ</h1>

    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <button @click="openModal('vm-create')" class="btn-primary">
        VM作成
      </button>
      <button @click="openModal('vm-edit')" class="btn-primary">VM編集</button>
      <button @click="openModal('net-create')" class="btn-primary">
        NW作成
      </button>
      <button @click="openModal('net-edit')" class="btn-primary">NW編集</button>
      <button @click="openModal('storage-add')" class="btn-primary">
        ストレージ追加
      </button>
    </div>

    <MoVirtualMachineCreate
      :show="activeModal === 'vm-create'"
      @close="closeModal"
    />

    <MoVirtualMachineEdit
      :show="activeModal === 'vm-edit'"
      :vm-data="dummyVmEditData"
      @close="closeModal"
    />

    <BaseModal
      :show="['net-create', 'net-edit', 'storage-add'].includes(activeModal)"
      :title="baseModalTitle"
      @close="closeModal"
    >
      <component :is="baseModalContent" @close="closeModal" />
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, shallowRef, markRaw } from "vue";

// --- モーダルコンポーネントのインポート ---
import MoVirtualMachineCreate from "~/components/MoVirtualMachineCreate.vue";
import MoVirtualMachineEdit from "~/components/MoVirtualMachineEdit.vue";
import BaseModal from "~/components/BaseModal.vue";
import AddLocalStorageForm from "~/components/MoLocalStorageAdd.vue";
import CreateVirtualNetworkForm from "~/components/MoVirtualNetworkCreate.vue";
import MoVirtualNetworkEdit from "~/components/MoVirtualNetworkEdit.vue";

// --- 状態管理 ---
// どのモーダルが開いているかを文字列で管理 (nullは全て閉じている状態)
const activeModal = ref(null);
// BaseModalで表示するタイトルと中身
const baseModalTitle = ref("");
const baseModalContent = shallowRef(null);

// --- 編集モーダル用のダミーデータ ---
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

// --- 関数 ---
const openModal = (modalName) => {
  // 単純なモーダルの場合は、タイトルと中身もセット
  if (modalName === "net-create") {
    baseModalTitle.value = "仮想ネットワーク作成";
    baseModalContent.value = markRaw(CreateVirtualNetworkForm);
  } else if (modalName === "net-edit") {
    baseModalTitle.value = "仮想ネットワーク編集";
    baseModalContent.value = markRaw(MoVirtualNetworkEdit);
  } else if (modalName === "storage-add") {
    baseModalTitle.value = "ローカルストレージ追加";
    baseModalContent.value = markRaw(AddLocalStorageForm);
  }

  activeModal.value = modalName;
};

const closeModal = () => {
  activeModal.value = null;
};
</script>

<style scoped>
.btn-primary {
  @apply py-2 px-5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700;
}
</style>
