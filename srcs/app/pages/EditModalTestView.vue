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
            <td class="px-6 py-4">{{ vm.node?.name || "-" }}</td>
            <td class="px-6 py-4 text-center">
              <button
                @click="openVmEditModal(vm)"
                class="btn-secondary text-xs px-3 py-1"
                title="仮想マシン編集"
              >
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
      <div v-if="itPending" class="mt-2 text-gray-500">一覧を読み込み中...</div>
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
            <th class="px-6 py-3">CPU</th>
            <th class="px-6 py-3">メモリ</th>
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
            <td class="px-6 py-4">{{ it.cpuCore }} vCPU</td>
            <td class="px-6 py-4">{{ it.memorySize }} Byte</td>
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
    </div>

    <div class="mt-8 pt-4 border-t">
      <h2 class="font-semibold text-lg">イメージ一覧 (API連携)</h2>
      <div v-if="imPending" class="mt-2 text-gray-500">一覧を読み込み中...</div>
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
          <tr v-for="img in images" :key="img.id" class="bg-white border-b">
            <td class="px-6 py-4 font-medium">{{ img.name }}</td>
            <td class="px-6 py-4">{{ img.description }}</td>
            <td class="px-6 py-4 text-center">
              <button @click="openImageEditModal(img)" class="btn-secondary">
                編集
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-8 pt-4 border-t">
      <h2 class="font-semibold text-lg">利用者一覧 (API連携)</h2>
      <div v-if="usersPending" class="mt-2 text-gray-500">
        一覧を読み込み中...
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
    </div>

    <div class="mt-8 pt-4 border-t">
      <h2 class="font-semibold text-lg">セキュリティグループ一覧 (API連携)</h2>
      <div v-if="sgPending" class="mt-2 text-gray-500">一覧を読み込み中...</div>
      <div v-else-if="sgError" class="mt-2 text-red-600">
        一覧の取得に失敗しました: {{ sgError.message }}
      </div>
      <table
        v-else-if="securityGroups && securityGroups.length > 0"
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
          <tr
            v-for="sg in securityGroups"
            :key="sg.id"
            class="bg-white border-b"
          >
            <td class="px-6 py-4 font-medium">{{ sg.name }}</td>
            <td class="px-6 py-4 text-gray-600">{{ sg.description || "-" }}</td>
            <td class="px-6 py-4 text-center">
              <button
                @click="openSecurityGroupEditModal(sg)"
                class="btn-secondary"
              >
                編集
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="mt-2 text-gray-500">
        表示できるセキュリティグループがありません。
      </div>
    </div>

    <div class="mt-8 pt-4 border-t">
      <h2 class="font-semibold text-lg">ストレージプール一覧 (API連携)</h2>
      <div v-if="spPending" class="mt-2 text-gray-500">一覧を読み込み中...</div>
      <div v-else-if="spError" class="mt-2 text-red-600">
        一覧の取得に失敗しました: {{ spError.message }}
      </div>
      <table
        v-else-if="storagePools && storagePools.length > 0"
        class="w-full mt-2 text-sm text-left"
      >
        <thead class="text-xs text-gray-700 uppercase bg-gray-100">
          <tr>
            <th class="px-6 py-3">名前</th>
            <th class="px-6 py-3">ノード</th>
            <th class="px-6 py-3">デバイスパス</th>
            <th class="px-6 py-3">NWアクセス</th>
            <th class="px-6 py-3 text-center">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="sp in storagePools" :key="sp.id" class="bg-white border-b">
            <td class="px-6 py-4 font-medium">{{ sp.name }}</td>
            <td class="px-6 py-4">{{ sp.node?.name || sp.nodeId }}</td>
            <td class="px-6 py-4">{{ sp.devicePath }}</td>
            <td class="px-6 py-4">
              <span v-if="sp.hasNetworkAccess" class="text-green-600 font-bold"
                >許可</span
              >
              <span v-else class="text-gray-500">拒否</span>
            </td>
            <td class="px-6 py-4 text-center">
              <button @click="openStorageEditModal(sp)" class="btn-secondary">
                編集
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-8 pt-4 border-t">
      <h2 class="font-semibold text-lg">バックアップ一覧 (API連携)</h2>
      <div v-if="bkPending" class="mt-2 text-gray-500">
        バックアップ一覧を読み込み中...
      </div>
      <div v-else-if="bkError" class="mt-2 text-red-600">
        一覧の取得に失敗しました: {{ bkError.message }}
      </div>
      <table
        v-else-if="backups && backups.length > 0"
        class="w-full mt-2 text-sm text-left"
      >
        <thead class="text-xs text-gray-700 uppercase bg-gray-100">
          <tr>
            <th class="px-6 py-3">名前</th>
            <th class="px-6 py-3">サイズ</th>
            <th class="px-6 py-3">作成日時</th>
            <th class="px-6 py-3 text-center">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="bk in backups" :key="bk.id" class="bg-white border-b">
            <td class="px-6 py-4 font-medium">{{ bk.name }}</td>
            <td class="px-6 py-4">
              {{
                bk.size
                  ? (bk.size / (1024 * 1024 * 1024)).toFixed(2) + " GB"
                  : "-"
              }}
            </td>
            <td class="px-6 py-4">
              {{ new Date(bk.createdAt).toLocaleString() }}
            </td>
            <td class="px-6 py-4 text-center">
              <button
                @click="openBackupRestoreModal(bk)"
                class="btn-secondary text-xs px-3 py-1 bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
              >
                復元
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="mt-2 text-gray-500">
        表示できるバックアップがありません。
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
import { ref, markRaw, computed } from "vue";
import { useResourceList } from "~/composables/useResourceList";

// --- コンポーネント ---
import MoVirtualMachineEdit from "~/components/MoVirtualMachineEdit.vue";
import MoInstanceTypeEdit from "~/components/MoInstanceTypeEdit.vue";
import MoImageEdit from "~/components/MoImageEdit.vue";
import MoUserEdit from "~/components/MoUserEdit.vue";
import MoSecurityGroupEdit from "~/components/MoSecurityGroupEdit.vue";
import MoBackupRestore from "~/components/MoBackupRestor.vue";
import MoStorageEdit from "~/components/MoStorageEdit.vue";

// --- State ---
const activeModal = ref<string | null>(null);
const targetResource = ref<any>(null);

// --- API連携 (一覧取得) ---

// 1. 仮想マシン
const {
  data: virtualMachines,
  pending: vmPending,
  error: vmError,
  refresh: refreshVms,
} = useResourceList<VirtualMachineResponse>("virtual-machines");

// 2. インスタンスタイプ
const {
  data: instanceTypes,
  pending: itPending,
  error: itError,
  refresh: refreshInstanceTypes,
} = useResourceList<InstanceTypeResponse>("instance-types");

// 3. イメージ
const {
  data: images,
  pending: imPending,
  error: imError,
  refresh: refreshImages,
} = useResourceList<ImageResponse>("images");

// 4. 利用者
const {
  data: users,
  pending: usersPending,
  error: usersError,
  refresh: refreshUsers,
} = useResourceList<UserResponse>("users");

// 5. セキュリティグループ
const {
  data: securityGroups,
  pending: sgPending,
  error: sgError,
  refresh: refreshSecurityGroups,
} = useResourceList<SecurityGroupResponse>("security-groups");

// 6. ストレージプール
const {
  data: storagePools,
  pending: spPending,
  error: spError,
  refresh: refreshStoragePools,
} = useResourceList<StoragePoolResponse>("storage-pools");

// ★★★ 追加: 7. バックアップ ★★★
const {
  data: backups,
  pending: bkPending,
  error: bkError,
  refresh: refreshBackups,
} = useResourceList<BackupResponse>("backups");

// --- モーダル定義 ---
const editModals = computed(() => [
  {
    id: "vmEdit",
    component: markRaw(MoVirtualMachineEdit),
    props: { vmId: targetResource.value?.id },
    refreshFn: refreshVms,
  },
  // ★★★ 修正: バックアップ復元モーダル ★★★
  {
    id: "backupRestore",
    component: markRaw(MoBackupRestore),
    // バックアップデータ(BackupResponse)を渡す
    props: { backupData: targetResource.value },
    refreshFn: refreshBackups, // 必要に応じて refreshVms などに変更可
  },
  {
    id: "instanceTypeEdit",
    component: markRaw(MoInstanceTypeEdit),
    props: { instanceTypeData: targetResource.value },
    refreshFn: refreshInstanceTypes,
  },
  {
    id: "imageEdit",
    component: markRaw(MoImageEdit),
    props: { imageData: targetResource.value },
    refreshFn: refreshImages,
  },
  {
    id: "userEdit",
    component: markRaw(MoUserEdit),
    props: { userData: targetResource.value },
    refreshFn: refreshUsers,
  },
  {
    id: "securityGroupEdit",
    component: markRaw(MoSecurityGroupEdit),
    props: { securityGroupData: targetResource.value },
    refreshFn: refreshSecurityGroups,
  },
  {
    id: "storageEdit",
    component: markRaw(MoStorageEdit),
    props: { storageData: targetResource.value },
    refreshFn: refreshStoragePools,
  },
]);

// --- Methods ---

const openModal = (modalId: string, resource: any) => {
  targetResource.value = resource;
  activeModal.value = modalId;
};

const closeModal = () => {
  activeModal.value = null;
  targetResource.value = null;
};

const handleSuccess = () => {
  const closedModal = editModals.value.find((m) => m.id === activeModal.value);
  if (closedModal?.refreshFn) {
    closedModal.refreshFn();
  }
  closeModal();
};

// Open Helpers
const openVmEditModal = (vm: VirtualMachineResponse) => openModal("vmEdit", vm);

const openBackupRestoreModal = (backup: BackupResponse) =>
  openModal("backupRestore", backup);

const openInstanceTypeEditModal = (it: InstanceTypeResponse) =>
  openModal("instanceTypeEdit", it);
const openImageEditModal = (image: ImageResponse) =>
  openModal("imageEdit", image);
const openUserEditModal = (user: UserResponse) => openModal("userEdit", user);
const openSecurityGroupEditModal = (sg: SecurityGroupResponse) =>
  openModal("securityGroupEdit", sg);
const openStorageEditModal = (sp: StoragePoolResponse) =>
  openModal("storageEdit", sp);
</script>
