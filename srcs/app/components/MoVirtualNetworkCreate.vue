<template>
  <BaseModal :show="show" title="仮想ネットワーク作成" @close="$emit('close')">
    <form @submit.prevent="submitForm" class="space-y-6">
      <div class="space-y-4">
        <FormInput
          label="ネットワーク名"
          name="network-name"
          type="text"
          v-model="name"
          v-bind="nameAttrs"
          :error="errors.name"
          :required="true"
          placeholder="例: my-vpc-01"
        />

        <FormInput
          label="ネットワークアドレス (CIDR)"
          name="network-cidr"
          type="text"
          v-model="cidr"
          v-bind="cidrAttrs"
          :error="errors.cidr"
          :required="true"
          placeholder="例: 10.0.0.0/16"
        />

        <div class="border rounded-md overflow-hidden bg-white mt-6">
          <div
            class="bg-gray-100 px-4 py-2 border-b flex justify-between items-center"
          >
            <h3 class="font-bold text-sm text-gray-700">初期サブネット</h3>
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
              v-if="initialSubnets.length === 0"
              class="text-center text-gray-400 py-2 text-sm"
            >
              サブネットがありません。追加ボタンから作成してください。
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="(field, index) in initialSubnets"
                :key="field.key"
                class="bg-white p-3 rounded border border-gray-200 shadow-sm"
              >
                <div class="grid grid-cols-12 gap-3 items-start">
                  <div class="col-span-5">
                    <label class="block text-xs text-gray-500 mb-1">名前</label>
                    <input
                      type="text"
                      v-model="field.value.name"
                      class="form-input-sm w-full"
                      :class="{ 'border-red-500': getError(index, 'name') }"
                      placeholder="例: public-subnet"
                    />
                    <p
                      v-if="getError(index, 'name')"
                      class="text-xs text-red-500 mt-1"
                    >
                      {{ getError(index, "name") }}
                    </p>
                  </div>

                  <div class="col-span-4">
                    <label class="block text-xs text-gray-500 mb-1">CIDR</label>
                    <input
                      type="text"
                      v-model="field.value.cidr"
                      class="form-input-sm w-full"
                      :class="{ 'border-red-500': getError(index, 'cidr') }"
                      placeholder="例: 10.0.1.0/24"
                    />
                    <p
                      v-if="getError(index, 'cidr')"
                      class="text-xs text-red-500 mt-1"
                    >
                      {{ getError(index, "cidr") }}
                    </p>
                  </div>

                  <div
                    class="col-span-3 flex flex-col items-end justify-center h-full pt-6"
                  >
                    <button
                      type="button"
                      @click="removeSubnet(index)"
                      class="text-red-500 text-xs hover:underline"
                    >
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
          @click="submitForm"
          class="btn btn-primary"
          :disabled="isCreating"
        >
          {{ isCreating ? "作成中..." : "作成" }}
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * 仮想ネットワーク作成モーダル (MoVirtualNetworkCreate.vue)
 * =================================================================================
 */
import { computed } from "vue";
import { useVirtualNetworkCreateForm } from "~/composables/modal/useVirtualNetworkCreateForm";
import FormInput from "~/components/Form/Input.vue";

// --- Props & Emits ---
defineProps({ show: { type: Boolean, required: true } });
const emit = defineEmits(["close", "success"]);

// --- Composable ---
const {
  errors,
  name,
  nameAttrs,
  cidr,
  cidrAttrs,
  initialSubnets,
  addSubnet,
  removeSubnet,
  isCreating,
  onFormSubmit,
} = useVirtualNetworkCreateForm();

// --- Helper: エラー取得 ---
const getError = (index: number, field: string) => {
  const bracketKey = `initialSubnets[${index}].${field}`;
  const dotKey = `initialSubnets.${index}.${field}`;

  const errs = errors.value as Record<string, string | undefined>;
  return errs[bracketKey] || errs[dotKey];
};

// --- Handler ---
const submitHandler = onFormSubmit(emit);
const submitForm = () => {
  submitHandler();
};
</script>

<style scoped>
.form-input-sm {
  @apply border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500;
}
</style>
