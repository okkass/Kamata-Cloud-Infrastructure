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
        <TabGeneral
          v-if="editedData"
          v-show="activeTab === 'general'"
          v-model="editedData"
        />
        <TabConfig
          v-if="editedData"
          v-show="activeTab === 'config'"
          v-model="editedData"
        />
        <TabNetwork
          v-if="editedData"
          v-show="activeTab === 'network'"
          v-model="editedData"
        />
      </div>
    </div>

    <template #footer>
      <div class="modal-footer flex justify-between w-full">
        <div></div>

        <div class="flex gap-2">
          <button
            type="button"
            @click="prevTab"
            class="btn btn-secondary"
            :disabled="isFirstTab || isSaving"
          >
            戻る
          </button>
          <button
            v-if="!isLastTab"
            type="button"
            @click="nextTab"
            class="btn btn-primary"
            :disabled="isSaving"
          >
            次へ
          </button>
          <button
            v-else
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
import { watch, computed } from "vue";
import type { PropType } from "vue";
import { useVirtualMachineEditForm } from "~/composables/modal/useVirtualMachineEditForm";
import TabGeneral from "/workspace/srcs/app/components/vm-edit-tabs/VmEditTabGeneral.vue";
import TabConfig from "/workspace/srcs/app/components/vm-edit-tabs/VmEditTabConfig.vue";
import TabNetwork from "/workspace/srcs/app/components/vm-edit-tabs/VmEditTabNetwork.vue";

const props = defineProps({
  show: { type: Boolean, required: true },
  vmData: {
    type: Object as PropType<any>,
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

const { activeTab, editedData, isSaving, updaterError, initializeForm, save } =
  useVirtualMachineEditForm();

const currentTabIndex = computed(() =>
  tabs.findIndex((t) => t.id === activeTab.value)
);
const isFirstTab = computed(() => currentTabIndex.value === 0);
const isLastTab = computed(() => currentTabIndex.value === tabs.length - 1);

const prevTab = () => {
  if (!isFirstTab.value) {
    const prev = tabs[currentTabIndex.value - 1];
    if (prev) {
      activeTab.value = prev.id;
    }
  }
};

const nextTab = () => {
  if (!isLastTab.value) {
    const next = tabs[currentTabIndex.value + 1];
    if (next) {
      activeTab.value = next.id;
    }
  }
};

watch(
  () => props.vmData,
  (newData) => {
    // データが渡ってきたら、編集フォームを初期化する
    if (newData && props.show) {
      console.log("初期化を開始します:", newData); // デバッグ用ログ
      initializeForm(newData);
    }
  },
  { immediate: true } // マウント時にデータがあれば即座に実行するオプション
);

const submitForm = () => {
  save(emit);
};
</script>
