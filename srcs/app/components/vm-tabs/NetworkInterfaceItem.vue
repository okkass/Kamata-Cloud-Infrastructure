<template>
  <div class="p-4 bg-gray-50 rounded-lg border border-gray-100 relative group">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
      <FormSelect
        label="仮想ネットワーク (VPC)"
        :name="`vpc-id-${index}`"
        v-model="modelValue.vpcId"
        :options="networks"
        :errorMessage="errors?.vpcId"
        placeholder="VPCを選択してください"
        :required="true"
        :pending="networksPending"
        :error="networksError"
        @update:model-value="handleVpcChange"
      >
        <template #option="{ option }">
          {{ option.name }}
          <span v-if="option.cidr" class="text-gray-500"
            >({{ option.cidr }})</span
          >
        </template>
      </FormSelect>

      <FormSelect
        label="サブネット"
        :name="`subnet-ids-${index}`"
        :model-value="modelValue.subnetIds"
        :options="availableSubnets"
        :errorMessage="errors?.subnetIds"
        placeholder="サブネットを選択してください"
        :required="true"
        :pending="networksPending"
        :disabled="!modelValue.vpcId"
        :error="networksError"
        @update:model-value="handleSubnetChange"
      >
        <template #option="{ option }">
          {{ option.name }}
          <span class="text-gray-500">({{ option.cidr }})</span>
        </template>
      </FormSelect>
    </div>

    <button
      type="button"
      @click="$emit('remove')"
      class="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-200 transition-colors"
      title="削除"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        class="w-5 h-5"
      >
        <path
          d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
        />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import FormSelect from "~/components/Form/Select.vue";

interface ValidationErrors {
  vpcId?: string;
  subnetIds?: string;
}

const props = defineProps<{
  modelValue: NetworkInterface;
  networks: VirtualNetworkResponse[];
  networksPending: boolean;
  networksError: any;
  errors?: ValidationErrors;
  index: number;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: NetworkInterface];
  remove: [];
}>();

// 選択されたVPCに紐づくサブネットリストを取得
const availableSubnets = computed(() => {
  if (!props.modelValue.vpcId) return [];
  const selectedVPC = props.networks.find(
    (net) => net.id === props.modelValue.vpcId
  );
  return selectedVPC?.subnets || [];
});

/**
 * VPC変更時の処理（サブネット選択をクリア）
 */
const handleVpcChange = (newVpcId: string | number | null | undefined) => {
  if (typeof newVpcId === "string") {
    emit("update:modelValue", {
      ...props.modelValue,
      vpcId: newVpcId,
      subnetIds: [],
    });
  }
};

/**
 * サブネット変更時の処理
 */
const handleSubnetChange = (
  newSubnetId: string | number | null | undefined
) => {
  if (typeof newSubnetId === "string") {
    emit("update:modelValue", {
      ...props.modelValue,
      subnetIds: [newSubnetId],
    });
  }
};
</script>
