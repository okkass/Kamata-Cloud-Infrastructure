<template>
  <BaseModal :show="show" :title="modalTitle" @close="$emit('close')">
    <div class="flex flex-col">
      <div class="flex border-b border-gray-200">
        <button
          v-for="(tab, index) in tabs"
          :key="tab.name"
          @click="currentTab = index"
          :class="[
            'py-2 px-4 text-sm font-medium',
            currentTab === index
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700',
          ]"
        >
          {{ tab.name }}
        </button>
      </div>

      <div class="pt-6">
        <keep-alive>
          <component
            :is="tabs[currentTab].component"
            v-bind="tabs[currentTab].props"
          />
        </keep-alive>
      </div>

      <div
        class="flex justify-between items-center mt-6 pt-4 border-t border-gray-200"
      ></div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, markRaw, computed } from "vue";
import SecondaryButton from "~/components/SecondaryButton.vue";
import VmEditTabGeneral from "~/components/vm-edit-tabs/VmEditTabGeneral.vue";
import VmEditTabConfig from "~/components/vm-edit-tabs/VmEditTabConfig.vue";
import VmEditTabNetwork from "~/components/vm-edit-tabs/VmEditTabNetwork.vue";

// ★★★ props定義を追加 ★★★
const props = defineProps({
  show: { type: Boolean, required: true },
  // 編集対象のVMデータを丸ごと受け取る
  vmData: { type: Object, required: true },
});
const emit = defineEmits(["close"]);

// ★★★ tabs配列の定義を修正 ★★★
// 各タブが表示される際に必要とするpropsを定義
const tabs = computed(() => [
  {
    name: "概要",
    component: markRaw(VmEditTabGeneral),
    props: { generalData: props.vmData.general },
  },
  {
    name: "構成",
    component: markRaw(VmEditTabConfig),
    props: { configData: props.vmData.config },
  },
  {
    name: "ネットワーク",
    component: markRaw(VmEditTabNetwork),
    props: { networkData: props.vmData.network },
  },
]);

const currentTab = ref(0);
const modalTitle = ref("仮想マシン編集");

const prevTab = () => {
  if (currentTab.value > 0) currentTab.value--;
};
const nextTab = () => {
  if (currentTab.value < tabs.value.length - 1) currentTab.value++;
};
const saveChanges = () => {
  alert("変更を保存します！");
  emit("close");
};
</script>
