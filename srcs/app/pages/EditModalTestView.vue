<template>
  <div class="p-8 space-y-8">
    <div>
      <h1 class="text-2xl font-bold mb-4">編集モーダル テストページ</h1>
      <p class="text-gray-600">
        各ボタンをクリックして、編集 (Edit)
        系のモーダルの見た目と基本的な動作を確認します。
      </p>
    </div>

    <div class="mt-8 pt-4 border-t">
      <h2 class="font-semibold text-lg">仮想マシン一覧 (API連携)</h2>

      <div v-if="pending" class="mt-2 text-gray-500">
        仮想マシン一覧を読み込み中...
      </div>

      <div v-else-if="error" class="mt-2 text-red-600">
        一覧の取得に失敗しました: {{ error.message }}
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
 * 編集モーダル テストページ
 * ---------------------------------------------------------------------------------
 * このページは、アプリケーション内で使用される「編集 (Edit)」系の
 * モーダルコンポーネントの表示と基本的な動作を確認するために使用されます。
 * 仮想マシン一覧はAPIから取得して表示します。
 * =================================================================================
 */
import { ref, markRaw, computed } from "vue";
// ★ API一覧取得用のComposableをインポート
import { useResourceList } from "~/composables/useResourceList";
// ★ 共有型定義から必要な型をインポート (VM用を追加)
import type { VirtualNetworkDTO, VirtualMachineDTO } from "~~/shared/types"; // VM用を追加

// ==============================================================================
// コンポーネントインポート (Edit系のみ)
// ==============================================================================
import MoVirtualMachineEdit from "~/components/MoVirtualMachineEdit.vue"; // ★ VM編集モーダル
import MoImageEdit from "~/components/MoImageEdit.vue";
import MoInstanceTypeEdit from "~/components/MoInstanceTypeEdit.vue";
import MoSecurityGroupEdit from "~/components/MoSecurityGroupEdit.vue";
import MoUserEdit from "~/components/MoUserEdit.vue";
import MoVirtualNetworkEdit from "~/components/MoVirtualNetworkEdit.vue";
// import MoStorageEdit from '~/components/MoStorageEdit.vue'; // 必要なら追加

// ==============================================================================
// State (状態管理)
// ==============================================================================
const activeModal = ref<string | null>(null);
const targetResource = ref<any>(null); // 編集対象のリソース (VMオブジェクトなど) を保持

// ==============================================================================
// API連携 (仮想マシン一覧取得)
// ==============================================================================
// ★ 仮想マシン一覧を取得するように修正
const {
  data: virtualMachines, // 取得したデータ (ref<VirtualMachineDTO[] | null>)
  pending, // 読み込み中フラグ (ref<boolean>)
  error, // エラーオブジェクト (ref<Error | null>)
  refresh, // データ再取得関数
} = useResourceList<VirtualMachineDTO>("virtual-machines"); // ★ エンドポイントを修正

// ==============================================================================
// モーダル定義 (Edit系のみ)
// ==============================================================================
const editModals = computed(() => [
  {
    id: "vmEdit",
    buttonText: "VM編集",
    component: markRaw(MoVirtualMachineEdit),
    // ★ MoVirtualMachineEdit が vmId を prop として受け取る想定
    props: { vmId: targetResource.value?.id }, // targetResource が VM データの場合
  },
  // {
  //   id: "netEdit",
  //   buttonText: "NW編集",
  //   component: markRaw(MoVirtualNetworkEdit),
  //   props: { networkId: targetResource.value?.id },
  // },
  // { id: "imageEdit", ... },
  // { id: "instanceTypeEdit", ... },
  // { id: "sgEdit", ... },
  // { id: "userEdit", ... },
]);

// ==============================================================================
// Methods (メソッド)
// ==============================================================================
/**
 * 指定されたIDのモーダルを開きます。
 * @param modalId 開きたいモーダルのID
 * @param resourceData モーダルに渡すデータ (編集対象のリソースなど)
 */
const openModal = (modalId: string, resourceData: any = null) => {
  targetResource.value = resourceData; // 編集対象をセット
  activeModal.value = modalId; // モーダルを開く
};

/**
 * 現在開いているモーダルを閉じます。
 */
const closeModal = () => {
  activeModal.value = null;
  targetResource.value = null; // 編集対象をクリア
};

/**
 * 仮想マシン編集モーダルを開く専用の関数。
 * @param vm 編集対象の仮想マシンデータ
 */
const openVmEditModal = (vm: VirtualMachineDTO) => {
  openModal("vmEdit", vm); // "vmEdit" IDのモーダルを開き、vmデータを渡す
};

/**
 * モーダルでの操作が成功したときに呼ばれるハンドラ。
 * モーダルを閉じ、一覧を再取得します。
 */
const handleSuccess = () => {
  closeModal();
  refresh(); // ★ 編集成功時に一覧を再取得して更新
};
</script>
