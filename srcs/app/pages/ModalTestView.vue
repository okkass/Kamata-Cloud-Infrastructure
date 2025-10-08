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
        class="btn-primary"
      >
        {{ modal.buttonText }}
      </button>
    </div>

    <div class="mt-8 pt-4 border-t">
      <h2 class="font-semibold text-lg">現在の仮想マシン一覧 (API連携)</h2>
      <div v-if="pending" class="mt-2">読み込み中...</div>
      <div v-else-if="error" class="mt-2 text-red-500">
        一覧の取得に失敗しました。
      </div>
      <table v-else class="w-full mt-2 text-sm text-left">
        <thead class="text-xs text-gray-700 uppercase bg-gray-100">
          <tr>
            <th class="px-6 py-3">名前</th>
            <th class="px-6 py-3">ステータス</th>
            <th class="px-6 py-3">ノード</th>
            <th class="px-6 py-3 text-center">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="vm in virtualMachines"
            :key="vm.id"
            class="bg-white border-b"
          >
            <td class="px-6 py-4 font-medium">{{ vm.name }}</td>
            <td class="px-6 py-4">{{ vm.status }}</td>
            <td class="px-6 py-4">{{ vm.node.name }}</td>
            <td class="px-6 py-4 text-center">
              <button @click="openVmEditModal(vm)" class="btn-secondary">
                編集
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <component
      v-for="modal in modals"
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
import { ref, markRaw, computed } from "vue";
import { useResourceList } from "~/composables/useResourceList";

// ==============================================================================
// 型定義 (VM一覧取得API用)
// ==============================================================================
interface ModelVirtualMachineDTO {
  id: string;
  name: string;
  status: string;
  node: {
    id: string;
    name: string;
  };
}

// ==============================================================================
// API連携 (VM一覧取得)
// ==============================================================================
const {
  data: virtualMachines,
  pending,
  error,
  refresh,
} = useResourceList<ModelVirtualMachineDTO>("virtual-machine");

// ==============================================================================
// 既存のコンポーネントインポート (変更なし)
// ==============================================================================
import MoVirtualMachineCreate from "~/components/MoVirtualMachineCreate.vue";
import MoVirtualMachineEdit from "~/components/MoVirtualMachineEdit.vue";
// (他のモーダルコンポーネントのインポートも同様)
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
const targetIdForEditing = ref<string | null>(null); // ★ 編集対象のVM IDを保持するstate

// ==============================================================================
// モーダル定義
// ==============================================================================
const modals = computed(() => [
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
    // ★★★ propsを動的に変更: vmData -> vmId ★★★
    props: {
      vmId: targetIdForEditing.value,
    },
  },
  // --- (他のモーダルの定義は変更なし) ---
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
  {
    id: "nodeAdd",
    buttonText: "クラスターにノード追加",
    component: markRaw(MoAddNodeToCluster),
    props: {
      nodes: [{ id: "node-x", name: "Node-X", ipAddress: "192.168.1.101" }],
    },
  },
  {
    id: "imageEdit",
    buttonText: "イメージ編集",
    component: markRaw(MoImageEdit),
    props: {
      imageData: {
        id: "img-001",
        name: "ubuntu-22.04-image",
        size: 8,
        description: "サンプル",
      },
    },
  },
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
        vcpus: 4,
        memory: 8,
        storage: 100,
      },
    },
  },
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
  // 「VM編集」ボタンが直接押された場合、IDがないので開かない
  if (modalId === "vmEdit" && !targetIdForEditing.value) {
    alert("一覧から編集したいVMを選択してください。");
    return;
  }
  activeModal.value = modalId;
};

const closeModal = () => {
  activeModal.value = null;
  targetIdForEditing.value = null; // 編集対象IDをクリア
};

// ★★★ VM編集モーダルを開く専用の関数を追加 ★★★
const openVmEditModal = (vm: ModelVirtualMachineDTO) => {
  targetIdForEditing.value = vm.id;
  openModal("vmEdit");
};

// ★★★ 作成・編集成功時に呼ばれる関数を追加 ★★★
const handleSuccess = () => {
  closeModal();
  refresh(); // 一覧を再取得して表示を更新
};
</script>

<style scoped>
/* (スタイルは変更なし) */
.btn-primary {
  @apply py-2 px-5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700;
}
.btn-secondary {
  @apply py-1 px-3 bg-gray-200 text-gray-800 font-semibold rounded-md shadow-sm hover:bg-gray-300;
}
</style>
