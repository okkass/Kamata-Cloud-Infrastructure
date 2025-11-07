<template>
  <div class="p-8 space-y-8">
    <div>
      <h1 class="text-2xl font-bold mb-4">編集モーダル テストページ</h1>
      <p class="text-gray-600">
        一覧から項目を選択し「編集」ボタンをクリックして、編集 (Edit)
        系のモーダルの動作を確認します。
      </p>
    </div>

    <div class="mt-8 pt-4 border-t">
      <h2 class="font-semibold text-lg">仮想マシン一覧 (API連携)</h2>

      <div v-if="vmPending" class="mt-2 text-gray-500">
        仮想マシン一覧を読み込み中...
      </div>

      <div v-else-if="vmError" class="mt-2 text-red-600">
        一覧の取得に失敗しました: {{ vmError.message }}
      </div>

      <table
        v-else-if="virtualMachines && virtualMachines.length > 0"
        class="w-full mt-2 text-sm text-left"
      >
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
            <td class="px-6 py-4">{{ vm.node?.name ?? "N/A" }}</td>
            <td class="px-6 py-4 text-center">
              <button @click="openVmEditModal(vm)" class="btn-secondary">
                編集
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else class="mt-2 text-gray-500">
        表示できる仮想マシンがありません。
      </div>
    </div>

    <component
      v-for="modal in editModals"
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
 * 編集モーダル テストページ (EditModalTestView.vue)
 * ---------------------------------------------------------------------------------
 * このページは、編集(Edit)系のモーダルコンポーネントの動作確認を行います。
 * 1. 必要なリソースの一覧 (例: VM一覧) をAPIから取得して表示します。
 * 2. 「編集」ボタンで、対象のID (vmIdなど) をモーダルに渡して開きます。
 * 3. モーダルが 'success' イベントを発行したら、一覧をリフレッシュします。
 * =================================================================================
 */
import { ref, markRaw, computed } from "vue";
// ★ API一覧取得用のComposable
import { useResourceList } from "~/composables/useResourceList";

// ★ 必要な型定義をインポート
import type { VirtualMachineDTO } from "~~/shared/types/virtual-machines";
// import type { VirtualNetworkDTO } from "~~/shared/types/virtual-networks";

// ==============================================================================
// コンポーネントインポート (Edit系)
// ==============================================================================
import MoVirtualMachineEdit from "~/components/MoVirtualMachineEdit.vue";
// import MoVirtualNetworkEdit from "~/components/MoVirtualNetworkEdit.vue";
// import MoImageEdit from "~/components/MoImageEdit.vue";
// import MoInstanceTypeEdit from "~/components/MoInstanceTypeEdit.vue";
// import MoSecurityGroupEdit from "~/components/MoSecurityGroupEdit.vue";
// import MoUserEdit from "~/components/MoUserEdit.vue";

// ==============================================================================
// State (状態管理)
// ==============================================================================
/** 現在アクティブなモーダルのID (例: 'vmEdit') */
const activeModal = ref<string | null>(null);
/** モーダルに渡す編集対象のリソース (例: VMオブジェクト) */
const targetResource = ref<any>(null);

// ==============================================================================
// API連携 (一覧取得)
// ==============================================================================
// --- 仮想マシン一覧 (MoVirtualMachineEdit のテスト用) ---
const {
  data: virtualMachines,
  pending: vmPending,
  error: vmError,
  refresh: refreshVms, // ★ リフレッシュ関数に別名
} = useResourceList<VirtualMachineDTO>("virtual-machines");

// --- 仮想ネットワーク一覧 (将来の拡張用) ---
// const {
//   data: virtualNetworks,
//   pending: netPending,
//   error: netError,
//   refresh: refreshNetworks,
// } = useResourceList<VirtualNetworkDTO>("virtual-networks");

// ==============================================================================
// モーダル定義 (★ 拡張ポイント)
// ==============================================================================
/**
 * ページ内で使用する全ての編集モーダルを定義します。
 * props は computed にすることで、targetResource の変更に動的に追従します。
 */
const editModals = computed(() => [
  {
    id: "vmEdit",
    component: markRaw(MoVirtualMachineEdit),
    // ★ MoVirtualMachineEdit が 'vmId' prop を受け取る
    props: { vmId: targetResource.value?.id },
    refreshFn: refreshVms, // ★ 成功時にこの関数を呼ぶ
  },
  // --- ここに他の編集モーダルを追加 ---
  // {
  //   id: "netEdit",
  //   component: markRaw(MoVirtualNetworkEdit),
  //   props: { networkId: targetResource.value?.id },
  //   refreshFn: refreshNetworks,
  // },
]);

// ==============================================================================
// Methods (メソッド)
// ==============================================================================
/**
 * 汎用モーダルオープン関数
 * @param modalId 'vmEdit' など、editModals で定義したID
 * @param resource 編集対象のオブジェクト (vm, net など)
 */
const openModal = (modalId: string, resource: any) => {
  targetResource.value = resource; // モーダルに渡すデータをセット
  activeModal.value = modalId; // モーダルを開く
};

/**
 * モーダルを閉じる
 */
const closeModal = () => {
  activeModal.value = null;
  targetResource.value = null; // 対象リソースをクリア
};

/**
 * モーダルが @success を発行した時の処理
 */
const handleSuccess = () => {
  // 閉じたモーダルに対応するリフレッシュ関数を探して実行
  const closedModal = editModals.value.find((m) => m.id === activeModal.value);
  if (closedModal?.refreshFn) {
    closedModal.refreshFn();
  }
  closeModal(); // モーダルを閉じる
};

// --- モーダルを開くためのヘルパー関数 ---

/**
 * 仮想マシン編集モーダルを開く
 * @param vm 編集対象の VirtualMachineDTO
 */
const openVmEditModal = (vm: VirtualMachineDTO) => {
  openModal("vmEdit", vm);
};

/**
 * (将来の拡張用) 仮想ネットワーク編集モーダルを開く
 * @param net 編集対象の VirtualNetworkDTO
 */
// const openNetworkEditModal = (net: VirtualNetworkDTO) => {
//   openModal("netEdit", net);
// };
</script>
