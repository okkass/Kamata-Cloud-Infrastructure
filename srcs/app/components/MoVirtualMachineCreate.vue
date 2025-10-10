<template>
  <BaseModal :show="show" :title="modalTitle" @close="$emit('close')" size="lg">
    <div>
      <div class="flex border-b border-gray-200">
        <button
          v-for="(tab, index) in tabs"
          :key="tab.name"
          @click="currentTab = index"
          :class="[
            'relative py-2 px-4 text-sm font-medium',
            currentTab === index ? 'tab-button-active' : 'tab-button',
          ]"
        >
          {{ tab.name }}
          <span
            v-if="!tabValidity[index]"
            class="tab-error-indicator"
            title="このタブに入力エラーがあります"
          ></span>
        </button>
      </div>

      <div class="pt-6 min-h-[300px]">
        <component
          v-for="(tab, index) in tabs"
          :key="index"
          v-show="currentTab === index"
          :is="tab.component"
          :ref="
            (el) => {
              if (el) tabRefs[index] = el;
            }
          "
        />
      </div>

      <div class="modal-footer">
        <div class="flex gap-3">
          <SecondaryButton @click="prevTab" :disabled="currentTab === 0">
            戻る
          </SecondaryButton>
          <button
            v-if="currentTab < tabs.length - 1"
            @click="nextTab"
            class="btn btn-primary"
          >
            次へ
          </button>
          <button
            v-else
            @click="handleSubmit"
            :disabled="isCreating"
            class="btn btn-submit"
          >
            {{ isCreating ? "作成中..." : "作成" }}
          </button>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
const emit = defineEmits(["close", "success"]);
const {
  currentTab,
  tabRefs,
  tabs,
  tabValidity,
  prevTab,
  nextTab,
  buildPayloadAndValidate,
} = useVmWizardForm();
const { executeCreate, isCreating } = useResourceCreate<
  VirtualMachineCreateRequestDTO,
  VirtualMachineDTO
>("virtual-machine");
const { addToast } = useToast();

defineProps({ show: { type: Boolean, required: true } });

// モーダルタイトルを定義
const modalTitle = ref("仮想マシン作成");

const handleSubmit = async () => {
  const payload = await buildPayloadAndValidate();

  if (!payload) return;

  const result = await executeCreate(payload);

  if (result.success) {
    addToast({
      type: "success",
      message: `仮想マシン「${payload.name}」が作成されました`,
    });
    emit("success");
  } else {
    addToast({
      type: "error",
      message: "仮想マシンの作成に失敗しました。",
      details: result.error?.message,
    });
  }
};
</script>
