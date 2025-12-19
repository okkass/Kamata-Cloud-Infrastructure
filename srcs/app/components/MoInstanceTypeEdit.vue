<template>
  <BaseModal
    :show="show"
    title="インスタンスタイプ編集"
    @close="$emit('close')"
    size="md"
  >
    <div v-if="!editedData" class="p-8 text-center text-gray-500">
      読み込み中...
    </div>

    <form v-else @submit.prevent="submitForm" class="space-y-6">
      <div
        v-if="updaterError"
        class="bg-red-50 text-red-600 p-3 rounded text-sm"
      >
        {{ updaterError }}
      </div>

      <div class="space-y-4">
        <FormInput
          label="名前"
          name="name"
          v-model="name"
          v-bind="nameAttrs"
          :error="errors.name"
          placeholder="例: standard-2vcpu-4gb"
          required
          class="w-full"
        />

        <FormInput
          label="vCPU"
          name="cpuCore"
          type="number"
          v-model.number="cpuCore"
          v-bind="cpuCoreAttrs"
          :error="errors.cpuCore"
          placeholder="2"
          required
          class="w-full"
        />

        <FormInput
          label="メモリ (MB)"
          name="memorySize"
          type="number"
          v-model.number="memorySizeGB"
          v-bind="memorySizeGBAttrs"
          :error="errors.memorySizeGB"
          placeholder="4"
          :step="1024"
          :min="512"
          required
          class="w-full"
        >
          <template #suffix>
            <span class="ml-2 text-gray-500 text-sm">MB</span>
          </template>
        </FormInput>
      </div>
    </form>

    <template #footer>
      <div class="modal-footer">
        <button
          type="button"
          @click="submitForm"
          class="btn btn-primary"
          :disabled="isSaving || !editedData"
        >
          {{ isSaving ? "保存中..." : "保存" }}
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { watch, type PropType } from "vue";
import { useInstanceTypeEditForm } from "~/composables/modal/useInstanceTypeEditForm";
import FormInput from "~/components/Form/Input.vue";

const props = defineProps({
  show: { type: Boolean, required: true },
  instanceTypeData: {
    type: Object as PropType<InstanceTypeResponse>,
    default: null,
  },
});

const emit = defineEmits(["close", "success"]);

const {
  editedData,
  name,
  nameAttrs,
  cpuCore,
  cpuCoreAttrs,
  memorySizeGB,
  memorySizeGBAttrs,
  errors,
  isSaving,
  updaterError,
  initializeForm,
  save,
} = useInstanceTypeEditForm();

watch(
  () => props.instanceTypeData,
  (newData) => {
    if (newData && props.show) {
      initializeForm(newData);
    }
  },
  { immediate: true }
);

const submitForm = async () => {
  const success = await save();
  if (success) {
    emit("success");
    emit("close");
  }
};
</script>
