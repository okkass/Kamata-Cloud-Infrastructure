<template>
  <section>
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-medium text-gray-900">
        ネットワークインターフェース
      </h3>
      <button
        type="button"
        @click="$emit('add')"
        class="text-sm px-3 py-1.5 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
      >
        + インターフェース追加
      </button>
    </div>

    <div v-if="networksPending" class="text-sm text-gray-500 mb-2">
      ネットワーク情報を取得中...
    </div>
    <div v-if="networksError" class="text-sm text-red-500 mb-2">
      ネットワーク情報の取得に失敗しました。
    </div>

    <div class="space-y-4">
      <NetworkInterfaceItem
        v-for="(iface, index) in modelValue"
        :key="iface.id || index"
        :model-value="iface"
        :networks="networks"
        :networks-pending="networksPending"
        :networks-error="networksError"
        :errors="errors?.[index]"
        :index="index"
        @update:model-value="updateInterface(index, $event)"
        @remove="removeInterface(index)"
      />

      <div
        v-if="modelValue.length === 0"
        class="text-center text-gray-400 py-8 border-2 border-dashed rounded-lg"
      >
        インターフェースがありません
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import NetworkInterfaceItem from "./NetworkInterfaceItem.vue";

interface ValidationErrors {
  vpcId?: string;
  subnetIds?: string;
}

const props = defineProps<{
  modelValue: NetworkInterface[];
  networks: VirtualNetworkResponse[];
  networksPending: boolean;
  networksError: any;
  errors?: ValidationErrors[];
}>();

const emit = defineEmits<{
  "update:modelValue": [value: { index: number; value: NetworkInterface }];
  add: [];
  remove: [index: number];
}>();

const updateInterface = (index: number, newInterface: NetworkInterface) => {
  emit("update:modelValue", { index, value: newInterface });
};

const removeInterface = (index: number) => {
  emit("remove", index);
};
</script>
