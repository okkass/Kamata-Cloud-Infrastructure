<template>
  <BaseModal
    :show="show"
    title="仮想マシン編集"
    @close="$emit('close')"
    size="xl"
  >
    <div v-if="!editedData" class="p-12 text-center text-gray-500">
      読み込み中...
    </div>

    <div v-else class="flex flex-col h-full">
      <div
        v-if="updaterError"
        class="mb-4 bg-red-50 text-red-600 p-3 rounded text-sm"
      >
        {{ updaterError }}
      </div>

      <div class="flex border-b mb-6">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          @click="activeTab = tab.id"
          class="px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200"
          :class="
            activeTab === tab.id
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          "
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="flex-1 overflow-y-auto px-1">
        <div v-show="activeTab === 'general'">
          <p class="text-gray-400 p-4 border dashed">
            TabGeneral コンポーネント領域
          </p>
        </div>

        <div v-show="activeTab === 'config'">
          <p class="text-gray-400 p-4 border dashed">
            TabConfig コンポーネント領域
          </p>
        </div>

        <div v-show="activeTab === 'network'">
          <p class="text-gray-400 p-4 border dashed">
            TabNetwork コンポーネント領域
          </p>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="modal-footer flex justify-between w-full">
        <div></div>

        <div class="flex gap-2">
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
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { watch, type PropType } from "vue";
import { useVirtualMachineEditForm } from "~/composables/modal/useVirtualMachineEditForm";

// 子コンポーネントのインポート (作成後にコメントアウトを解除してください)
import TabGeneral from "./VirtualMachine/TabGeneral.vue";
import TabConfig from "./VirtualMachine/TabConfig.vue";
// import TabNetwork from "./VirtualMachine/TabNetwork.vue";

const props = defineProps({
  show: { type: Boolean, required: true },
  vmData: {
    type: Object as PropType<VirtualMachineResponse>,
    default: null,
  },
});

const emit = defineEmits(["close", "success"]);

// タブ定義
const tabs = [
  { id: "general", label: "一般" },
  { id: "config", label: "コンピュート・ストレージ" },
  { id: "network", label: "ネットワーク" },
] as const;

// Composable
const { activeTab, editedData, isSaving, updaterError, initializeForm, save } =
  useVirtualMachineEditForm();

// モーダル表示時にデータ初期化
watch(
  () => props.vmData,
  (newData) => {
    if (newData && props.show) {
      initializeForm(newData);
    }
  },
  { immediate: true }
);

const submitForm = () => {
  save(emit);
};
</script>
