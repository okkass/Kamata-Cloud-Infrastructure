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

    <div class="mt-8 pt-4 border-t">
      <h2 class="font-semibold text-lg">インスタンスタイプ一覧 (API連携)</h2>

      <div v-if="itPending" class="mt-2 text-gray-500">
        インスタンスタイプ一覧を読み込み中...
      </div>
      <div v-else-if="itError" class="mt-2 text-red-600">
        一覧の取得に失敗しました: {{ itError.message }}
      </div>
      <table
        v-else-if="instanceTypes && instanceTypes.length > 0"
        class="w-full mt-2 text-sm text-left"
      >
        <thead class="text-xs text-gray-700 uppercase bg-gray-100">
          <tr>
            <th class="px-6 py-3">名前</th>
            <th class="px-6 py-3">vCPU (個)</th>
            <th class="px-6 py-3">メモリ (MB)</th>
            <th class="px-6 py-3 text-center">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="it in instanceTypes"
            :key="it.id"
            class="bg-white border-b"
          >
            <td class="px-6 py-4 font-medium">{{ it.name }}</td>
            <td class="px-6 py-4">{{ it.cpuCore }}</td>
            <td class="px-6 py-4">
              {{ convertByteToUnit(it.memorySize, "MB") }} MB
            </td>
            <td class="px-6 py-4 text-center">
              <button
                @click="openInstanceTypeEditModal(it)"
                class="btn-secondary"
              >
                編集
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="mt-2 text-gray-500">
        表示できるインスタンスタイプがありません。
      </div>
    </div>

    <div class="mt-8 pt-4 border-t">
      <h2 class="font-semibold text-lg">イメージ一覧 (API連携)</h2>

      <div v-if="imPending" class="mt-2 text-gray-500">
        イメージ一覧を読み込み中...
      </div>

      <div v-else-if="imError" class="mt-2 text-red-600">
        一覧の取得に失敗しました: {{ imError.message }}
      </div>

      <table
        v-else-if="images && images.length > 0"
        class="w-full mt-2 text-sm text-left"
      >
        <thead class="text-xs text-gray-700 uppercase bg-gray-100">
          <tr>
            <th class="px-6 py-3">名前</th>
            <th class="px-6 py-3">説明</th>
            <th class="px-6 py-3 text-center">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="image in images" :key="image.id" class="bg-white border-b">
            <td class="px-6 py-4 font-medium">{{ image.name }}</td>
            <td class="px-6 py-4 truncate max-w-xs" :title="image.description">
              {{ image.description || "N/A" }}
            </td>
            <td class="px-6 py-4 text-center">
              <button @click="openImageEditModal(image)" class="btn-secondary">
                編集
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="mt-2 text-gray-500">
        表示できるイメージがありません。
      </div>
    </div>

    <div class="mt-8 pt-4 border-t">
      <h2 class="font-semibold text-lg">利用者一覧 (API連携)</h2>

      <div v-if="usersPending" class="mt-2 text-gray-500">
        利用者一覧を読み込み中...
      </div>

      <div v-else-if="usersError" class="mt-2 text-red-600">
        一覧の取得に失敗しました: {{ usersError.message }}
      </div>

      <table
        v-else-if="users && users.length > 0"
        class="w-full mt-2 text-sm text-left"
      >
        <thead class="text-xs text-gray-700 uppercase bg-gray-100">
          <tr>
            <th class="px-6 py-3">名前</th>
            <th class="px-6 py-3">メールアドレス</th>
            <th class="px-6 py-3">権限</th>
            <th class="px-6 py-3 text-center">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id" class="bg-white border-b">
            <td class="px-6 py-4 font-medium">{{ user.name }}</td>
            <td class="px-6 py-4">{{ user.email }}</td>
            <td class="px-6 py-4">
              <span v-if="user.isAdmin" class="text-blue-600 font-bold"
                >全体管理者</span
              >
              <span v-else class="text-gray-500">一般</span>
            </td>
            <td class="px-6 py-4 text-center">
              <button @click="openUserEditModal(user)" class="btn-secondary">
                編集
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="mt-2 text-gray-500">
        表示できる利用者がありません。
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
  </div>
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * 編集モーダル テストページ (EditModalTestView.vue)
 * =================================================================================
 */
import { ref, markRaw, computed } from "vue";
import { useResourceList } from "~/composables/useResourceList"; // ★ 単位変換ユーティリティをインポート
import { convertByteToUnit } from "~/utils/format"; // ★ 必要な型定義をインポート
import type { VirtualMachineDTO } from "~~/shared/types/dto/virtual-machine";
import type { InstanceTypeDTO as ModelInstanceTypeDTO } from "~~/shared/types/dto/instance-type";
import type { ImageDTO } from "~~/shared/types/dto/image";
import type { UserServerBase } from "~~/shared/types/dto/user/UserServerBase";

// ==============================================================================
// コンポーネントインポート (Edit系)
// ==============================================================================
import MoVirtualMachineEdit from "~/components/MoVirtualMachineEdit.vue";
import MoInstanceTypeEdit from "~/components/MoInstanceTypeEdit.vue";
import MoImageEdit from "~/components/MoImageEdit.vue";
import MoUserEdit from "~/components/MoUserEdit.vue";

// ==============================================================================
// State (状態管理)
// ==============================================================================
const activeModal = ref<string | null>(null);
const targetResource = ref<any>(null);

// ==============================================================================
// API連携 (一覧取得)
// ==============================================================================
const {
  data: virtualMachines,
  pending: vmPending,
  error: vmError,
  refresh: refreshVms,
} = useResourceList<VirtualMachineDTO>("virtual-machines");

const {
  data: instanceTypes,
  pending: itPending,
  error: itError,
  refresh: refreshInstanceTypes,
} = useResourceList<ModelInstanceTypeDTO>("instance-types");

const {
  data: images,
  pending: imPending,
  error: imError,
  refresh: refreshImages,
} = useResourceList<ImageDTO>("images");

const {
  data: users,
  pending: usersPending,
  error: usersError,
  refresh: refreshUsers,
} = useResourceList<UserServerBase>("users");

// ==============================================================================
// モーダル定義
// ==============================================================================
const editModals = computed(() => [
  // (VM編集 ... 既存)
  {
    id: "vmEdit",
    component: markRaw(MoVirtualMachineEdit),
    props: { vmId: targetResource.value?.id },
    refreshFn: refreshVms,
  },
  // (インスタンスタイプ編集 ... 既存)
  {
    id: "instanceTypeEdit",
    component: markRaw(MoInstanceTypeEdit),
    props: { instanceTypeData: targetResource.value },
    refreshFn: refreshInstanceTypes,
  },
  // (イメージ編集 ... 既存)
  {
    id: "imageEdit",
    component: markRaw(MoImageEdit),
    props: { imageData: targetResource.value },
    refreshFn: refreshImages,
  },
  // --- ★ MoUserEdit の定義を追加 ---
  {
    id: "userEdit",
    component: markRaw(MoUserEdit),
    // ★ MoUserEdit が 'userData' prop を受け取るようにデータを渡す
    props: { userData: targetResource.value },
    refreshFn: refreshUsers, // ★ 成功時に users をリフレッシュ
  },
]);

// ==============================================================================
// Methods (メソッド)
// ==============================================================================
/**
 * 汎用モーダルオープン関数
 */
const openModal = (modalId: string, resource: any) => {
  targetResource.value = resource;
  activeModal.value = modalId;
};

/** モーダルを閉じる */
const closeModal = () => {
  activeModal.value = null;
  targetResource.value = null;
};

/** モーダルが @success を発行した時の処理 */
const handleSuccess = () => {
  const closedModal = editModals.value.find((m) => m.id === activeModal.value);
  if (closedModal?.refreshFn) {
    closedModal.refreshFn();
  }
  closeModal();
};

// --- モーダルを開くためのヘルパー関数 ---
const openVmEditModal = (vm: VirtualMachineDTO) => {
  openModal("vmEdit", vm);
};

const openInstanceTypeEditModal = (it: ModelInstanceTypeDTO) => {
  openModal("instanceTypeEdit", it);
};

const openImageEditModal = (image: ImageDTO) => {
  openModal("imageEdit", image);
};

const openUserEditModal = (user: UserServerBase) => {
  openModal("userEdit", user);
};
</script>
