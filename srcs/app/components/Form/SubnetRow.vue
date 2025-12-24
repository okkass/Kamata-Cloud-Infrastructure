<template>
  <div
    class="bg-white p-3 rounded border border-gray-200 shadow-sm relative group"
  >
    <div class="grid grid-cols-12 gap-3 items-start">
      <div class="col-span-5">
        <FormInput
          label="名前"
          :name="`${namePrefix}.name`"
          v-model="modelValue.name"
          :error="nameError"
          placeholder="例: public-subnet"
          required
        />
      </div>

      <div class="col-span-5">
        <FormInput
          label="CIDR"
          :name="`${namePrefix}.cidr`"
          v-model="modelValue.cidr"
          :error="cidrError"
          placeholder="例: 10.0.1.0/24"
          required
        />
      </div>

      <div class="col-span-2 flex justify-end pt-6">
        <button
          type="button"
          @click="$emit('remove')"
          class="text-gray-400 hover:text-red-500 p-1 transition-colors"
          title="削除"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
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
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SubnetFormValues } from "~/utils/validations/virtual-network";

defineProps<{
  /** vee-validate上のパス (例: subnets[0]) */
  namePrefix: string;
  /** v-model で渡されるサブネットオブジェクト */
  modelValue: SubnetFormValues;
  nameError?: string;
  cidrError?: string;
}>();

defineEmits<{
  (e: "remove"): void;
  (e: "update:modelValue", value: SubnetFormValues): void;
}>();
</script>
