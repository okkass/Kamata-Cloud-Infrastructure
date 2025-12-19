<template>
  <BaseModal
    :show="show"
    title="仮想ネットワーク編集"
    @close="handleClose"
    size="lg"
  >
    <div v-if="!editedData" class="p-8 text-center text-gray-500">
      読み込み中...
    </div>

    <form
      v-else
      @submit.prevent="onSubmit"
      id="network-edit-form"
      class="space-y-6"
    >
      <div class="space-y-4">
        <FormInput
          label="ネットワーク名"
          name="network-name"
          v-model="name"
          v-bind="nameAttrs"
          :error="errors.name"
          placeholder="my-vpc-01"
          required
        />

        <FormInput
          label="ネットワークアドレス (CIDR) ※作成後の変更不可"
          name="network-cidr"
          :model-value="editedData.cidr"
          class="bg-gray-100 text-gray-500 cursor-not-allowed"
          readonly
        />

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
              v-if="subnets.length === 0"
              class="text-center text-gray-400 py-2 text-sm"
            >
              サブネットがありません。
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="(subnet, index) in subnets"
                :key="subnet.key"
                class="bg-white p-3 rounded border border-gray-200 shadow-sm"
              >
                <div class="grid grid-cols-12 gap-3 items-end">
                  <div class="col-span-5">
                    <FormInput
                      label="名前"
                      :name="`subnet-name-${index}`"
                      v-model="subnet.value.name"
                      placeholder="例: public-subnet"
                      required
                    />
                  </div>

                  <div class="col-span-5">
                    <FormInput
                      label="CIDR"
                      :name="`subnet-cidr-${index}`"
                      v-model="subnet.value.cidr"
                      placeholder="例: 10.0.1.0/24"
                      required
                    />
                  </div>

                  <div class="col-span-2 flex justify-end pb-3">
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
          :disabled="isSaving || !isValid"
          :loading="isSaving"
          label="仮想ネットワークを更新"
          form="network-edit-form"
          type="submit"
        />
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { type PropType } from "vue";
import { useVirtualNetworkEditForm } from "~/composables/modal/useVirtualNetworkEditForm";
import FormInput from "~/components/Form/Input.vue";
import UiSubmitButton from "~/components/ui/SubmitButton.vue";

const props = defineProps({
  show: { type: Boolean, required: true },
  virtualNetworkData: {
    type: Object as PropType<VirtualNetworkResponse | null>,
    default: null,
  },
});

const emit = defineEmits(["close", "success"]);

const {
  editedData,
  errors,
  name,
  nameAttrs,
  subnets,
  addSubnet,
  removeSubnet,
  isValid,
  isSaving,
  onFormSubmit,
  makehandleClose,
} = useVirtualNetworkEditForm(props);
const handleClose = makehandleClose(emit);
const onSubmit = onFormSubmit(emit);
</script>
