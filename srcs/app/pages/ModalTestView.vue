<template>
  <div class="p-8 space-y-8">
    <div>
      <h1 class="text-2xl font-bold mb-4">モーダル表示テストページ</h1>
      <p class="text-gray-600">
        各ボタンをクリックして、モーダルの見た目と基本的な動作を確認します。
      </p>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
      <button
        v-for="modal in modals"
        :key="modal.id"
        @click="openModal(modal.id)"
        class="btn btn-primary"
      >
        {{ modal.buttonText }}
      </button>
    </div>

    <component
      v-for="modal in modals"
      :key="modal.id"
      :is="modal.component"
      :show="activeModal === modal.id"
      v-bind="modal.props"
      @close="closeModal"
    />
  </div>
</template>

<script setup>
import { ref, markRaw, computed } from "vue";

// ==============================================================================
// コンポーネントのインポート
// ==============================================================================
import MoVirtualMachineCreate from "~/components/MoVirtualMachineCreate.vue";
import MoVirtualMachineEdit from "~/components/MoVirtualMachineEdit.vue";
import MoAddNodeToCluster from "~/components/MoAddNodeToCluster.vue";
import MoImageEdit from "~/components/MoImageEdit.vue";
import MoInstanceTypeAdd from "~/components/MoInstanceTypeAdd.vue";
import MoInstanceTypeEdit from "~/components/MoInstanceTypeEdit.vue";
import MoSecurityGroupCreate from "~/components/MoSecurityGroupCreate.vue";
import MoSecurityGroupEdit from "~/components/MoSecurityGroupEdit.vue";
import MoNetworkStorageAdd from "~/components/MoNetworkStorageAdd.vue";
import MoUserAdd from "~/components/MoUserAdd.vue";
import MoUserEdit from "~/components/MoUserEdit.vue";
import MoVirtualNetworkCreate from "~/components/MoVirtualNetworkCreate.vue";
import MoVirtualNetworkEdit from "~/components/MoVirtualNetworkEdit.vue";
import MoLocalStorageAdd from "~/components/MoLocalStorageAdd.vue";

// ==============================================================================
// State
// ==============================================================================
const activeModal = ref(null);

// ==============================================================================
// モーダル定義 (ダミーデータもここで管理)
// ★★★ 'type'が不要になり、すべてのモーダルが同じ構造になりました ★★★
// ==============================================================================
const modals = computed(() => [
  // --- VM ---
  {
    id: "vmCreate",
    buttonText: "VM作成",
    component: markRaw(MoVirtualMachineCreate),
    props: {},
  },
  {
    id: "vmEdit",
    buttonText: "VM編集",
    component: markRaw(MoVirtualMachineEdit),
    props: {
      vmData: {
        /* ... */
      },
    },
  },
  // --- Network ---
  {
    id: "netCreate",
    buttonText: "NW作成",
    component: markRaw(MoVirtualNetworkCreate),
    props: {},
  },
  {
    id: "netEdit",
    buttonText: "NW編集",
    component: markRaw(MoVirtualNetworkEdit),
    props: { networkData: { name: "edit-net", subnets: [] } },
  },
  // --- Storage ---
  {
    id: "storageAdd",
    buttonText: "ストレージ追加",
    component: markRaw(MoLocalStorageAdd),
    props: { nodes: [], availableDisks: [] },
  },
  {
    id: "networkStorageAdd",
    buttonText: "NWストレージ追加",
    component: markRaw(MoNetworkStorageAdd),
    props: { nodes: [], localStorages: [] },
  },
  // --- Node ---
  {
    id: "nodeAdd",
    buttonText: "クラスターにノード追加",
    component: markRaw(MoAddNodeToCluster),
    props: {
      nodes: [{ id: "node-x", name: "Node-X", ipAddress: "192.168.1.101" }],
    },
  },
  // --- Image ---
  {
    id: "imageEdit",
    buttonText: "イメージ編集",
    component: markRaw(MoImageEdit),
    props: {
      imageData: {
        id: "img-001",
        name: "ubuntu-22.04-image",
        cpuCores: 2,
        memorySize: 2048,
      },
    },
  },
  // --- Instance Type ---
  {
    id: "instanceTypeAdd",
    buttonText: "タイプ追加",
    component: markRaw(MoInstanceTypeAdd),
    props: {},
  },
  {
    id: "instanceTypeEdit",
    buttonText: "タイプ編集",
    component: markRaw(MoInstanceTypeEdit),
    props: {
      instanceTypeData: {
        id: "itype-001",
        name: "standard.medium",
        cpuCores: 4,
        memorySize: 8,
        storage: 100,
      },
    },
  },
  // --- Security Group ---
  {
    id: "sgCreate",
    buttonText: "SG作成",
    component: markRaw(MoSecurityGroupCreate),
    props: {},
  },
  {
    id: "sgEdit",
    buttonText: "SG編集",
    component: markRaw(MoSecurityGroupEdit),
    props: {
      securityGroupData: {
        id: "sg-001",
        name: "web-server-rules",
        inboundRules: [],
        outboundRules: [],
      },
    },
  },
  // --- User ---
  {
    id: "userAdd",
    buttonText: "利用者追加",
    component: markRaw(MoUserAdd),
    props: {},
  },
  {
    id: "userEdit",
    buttonText: "利用者編集",
    component: markRaw(MoUserEdit),
    props: {
      userData: { name: "test-user", maxMemorySize: 0, maxStorageSize: 0 },
    },
  },
]);

// ==============================================================================
// Methods
// ==============================================================================
const openModal = (modalId) => {
  activeModal.value = modalId;
};

const closeModal = () => {
  activeModal.value = null;
};
</script>
