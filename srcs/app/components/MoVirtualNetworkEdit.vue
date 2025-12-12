<template>
  <BaseModal
    :show="show"
    title="仮想ネットワーク編集"
    @close="$emit('close')"
    size="lg"
  >
    <div v-if="!editedData" class="p-8 text-center text-gray-500">
      読み込み中...
    </div>

    <form v-else @submit.prevent="submitForm" class="space-y-6">
      <div
        v-if="updaterError"
        class="bg-red-50 text-red-600 p-3 rounded text-sm"
      >
        {{ updaterError }}
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            ネットワーク名
          </label>
          <input
            type="text"
            v-model="editedData.name"
            class="form-input w-full"
            placeholder="my-vpc-01"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            ネットワークアドレス (CIDR)
            <span class="text-xs text-gray-400 font-normal ml-2"
              >※作成後の変更不可</span
            >
          </label>
          <input
            type="text"
            :value="editedData.cidr"
            class="form-input w-full bg-gray-100 text-gray-500 cursor-not-allowed"
            readonly
          />
        </div>

        <div class="border rounded-md overflow-hidden bg-white mt-6">
          <div
            class="bg-gray-100 px-4 py-2 border-b flex justify-between items-center"
          >
            <h3 class="font-bold text-sm text-gray-700">サブネット構成</h3>
            <button
              type="button"
              @click="addSubnet"
              class="text-xs bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-2 py-1 rounded shadow-sm transition-colors"
            >
              + 追加
            </button>
          </div>

          <div class="p-4 bg-gray-50">
            <div
              v-if="!editedData.subnets || editedData.subnets.length === 0"
              class="text-center text-gray-400 py-2 text-sm"
            >
              サブネットがありません。
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="(subnet, index) in editedData.subnets"
                :key="subnet.id || index"
                class="bg-white p-3 rounded border border-gray-200 shadow-sm"
              >
                <div class="grid grid-cols-12 gap-3 items-end">
                  <div class="col-span-5">
                    <label class="block text-xs text-gray-500 mb-1">名前</label>
                    <input
                      type="text"
                      v-model="subnet.name"
                      class="form-input-sm w-full"
                      placeholder="例: public-subnet"
                      required
                    />
                  </div>

                  <div class="col-span-5">
                    <label class="block text-xs text-gray-500 mb-1">CIDR</label>
                    <input
                      type="text"
                      v-model="subnet.cidr"
                      class="form-input-sm w-full"
                      placeholder="例: 10.0.1.0/24"
                      required
                    />
                  </div>

                  <div class="col-span-2 flex justify-end pb-1">
                    <button
                      type="button"
                      @click="removeSubnet(index)"
                      class="text-gray-400 hover:text-red-500 p-1 flex items-center gap-1 text-xs"
                      title="削除"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      削除
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>

    <template #footer>
      <div class="modal-footer">
        <button
          type="button"
          @click="$emit('close')"
          class="btn btn-secondary"
          :disabled="isSaving"
        >
          キャンセル
        </button>
        <button
          type="button"
          @click="submitForm"
          class="btn btn-primary"
          :disabled="isSaving || !editedData"
        >
          {{ isSaving ? "保存中..." : "保存" }}
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { watch, type PropType } from "vue";
import { useVirtualNetworkEditForm } from "~/composables/modal/useVirtualNetworkEditForm";

// 型定義 (VirtualNetworkResponse) は自動インポート前提

const props = defineProps({
  show: { type: Boolean, required: true },
  networkData: {
    type: Object as PropType<VirtualNetworkResponse>,
    default: null,
  },
});

const emit = defineEmits(["close", "success"]);

// Composable
const {
  editedData,
  isSaving,
  updaterError,
  initializeForm,
  addSubnet,
  removeSubnet,
  save,
} = useVirtualNetworkEditForm();

// モーダルが開かれたとき(データが渡されたとき)に初期化
watch(
  () => props.networkData,
  (newData) => {
    if (newData && props.show) {
      initializeForm(newData);
    }
  },
  { immediate: true }
);

// 保存処理
const submitForm = () => {
  save(emit);
};
</script>

<style scoped>
.form-input {
  @apply border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500;
}
.form-input-sm {
  @apply border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500;
}
</style>
