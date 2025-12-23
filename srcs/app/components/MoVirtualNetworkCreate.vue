<template>
  <BaseModal :show="show" title="仮想ネットワーク作成" @close="handleClose">
    <form id="network-create-form" @submit.prevent="onSubmit" class="space-y-6">
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
                    <FormInput
                      label="名前"
                      :name="`subnet-name-${index}`"
                      :error="getError(index, 'name')"
                      v-model="field.value.name"
                      placeholder="例: public-subnet"
                    />
                  </div>

                  <div class="col-span-4">
                    <FormInput
                      label="CIDR"
                      :name="`subnet-cidr-${index}`"
                      :error="getError(index, 'cidr')"
                      v-model="field.value.cidr"
                      placeholder="例: 10.0.1.0/24"
                    />
                  </div>

                  <div class="col-span-3 flex justify-end pt-6">
                    <button
                      type="button"
                      @click="removeSubnet(index)"
                      class="text-gray-400 hover:text-red-500 p-1 flex items-center gap-1 text-xs"
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
            </div>
          </div>
        </div>
      </div>
    </form>

    <template #footer>
      <div class="modal-footer">
        <UiSubmitButton
          :disabled="isCreating || !isValid"
          :loading="isCreating"
          label="仮想ネットワークを作成"
          form="network-create-form"
          type="submit"
        />
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { type PropType } from "vue";
import { useVirtualNetworkCreateForm } from "~/composables/modal/useVirtualNetworkCreateForm";
import FormInput from "~/components/Form/Input.vue";
import UiSubmitButton from "~/components/ui/SubmitButton.vue";

defineProps({ show: { type: Boolean, required: true } });
const emit = defineEmits(["close", "success"]);

const getError = (index: number, field: string) => {
  const bracketKey = `initialSubnets[${index}].${field}`;

  const errs = errors.value as Record<string, string | undefined>;
  return errs[bracketKey];
};

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
  isValid,
  onFormSubmit,
  makehandleClose,
} = useVirtualNetworkCreateForm(emit);
const handleClose = makehandleClose(emit);
const onSubmit = onFormSubmit(emit);
</script>
