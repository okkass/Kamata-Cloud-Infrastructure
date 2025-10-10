<template>
  <BaseModal
    :show="show"
    title="インスタンスタイプの追加"
    @close="$emit('close')"
  >
    <form @submit.prevent="onSubmit" class="modal-space">
      <FormInput
        label="インスタンスタイプ名"
        name="instance-type-name"
        type="text"
        :placeholder="'例: standard.xlarge'"
        v-model="name"
        v-model:attrs="nameAttrs"
        :error="errors.name"
      />

      <FormInput
        label="CPUコア数"
        name="instance-vcpu"
        type="number"
        placeholder="例: 16"
        v-model.number="vcpus"
        v-model:attrs="vcpusAttrs"
        :error="errors.vcpus"
      />

      <FormInput
        label="メモリ数"
        name="instance-memory"
        type="number"
        placeholder="例: 32"
        v-model.number="memory"
        v-model:attrs="memoryAttrs"
        :error="errors.memory"
      >
        <template #suffix>
          <span class="font-semibold text-gray-600">MB</span>
        </template>
      </FormInput>
      <div class="modal-footer">
        <button type="submit" class="btn btn-primary" :disabled="isCreating">
          {{ isCreating ? "作成中..." : "作成" }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>

<script setup lang="ts">
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";

// --- Props & Emits ---
defineProps({ show: { type: Boolean, required: true } });
const emit = defineEmits(["close", "success"]);

// --- API & Toast ---
const { executeCreate, isCreating } = useResourceCreate<
  InstanceTypeCreateRequestDTO,
  ModelInstanceTypeDTO
>("instance-type");
const { addToast } = useToast();

// ★ 1. Zodでバリデーションスキーマを定義
const validationSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, "インスタンスタイプ名は必須です。"),
    vcpus: z.number({ required_error: "CPUコア数は必須です。" }).int().min(1),
    memory: z.number({ required_error: "メモリ数は必須です。" }).int().min(1),
  })
);

// ★ 2. vee-validateのuseFormをセットアップ
const { errors, defineField, handleSubmit } = useForm({
  validationSchema,
  initialValues: {
    memory: 1024,
    vcpus: 1,
  },
});
const [name, nameAttrs] = defineField("name");
const [vcpus, vcpusAttrs] = defineField("vcpus");
const [memory, memoryAttrs] = defineField("memory");

// ★ 3. handleSubmitでラップして、バリデーション通過時のみAPIを呼ぶ
const onSubmit = handleSubmit(async (values) => {
  const payload: InstanceTypeCreateRequestDTO = {
    name: values.name,
    cpuCores: values.vcpus,
    memorySize: convertByteToUnit(values.memory, "MB"),
  };

  const result = await executeCreate(payload);

  if (result.success) {
    addToast({
      type: "success",
      message: "インスタンスタイプが作成されました",
    });
    emit("success");
  } else {
    addToast({
      type: "error",
      message: "作成に失敗しました。",
      details: result.error?.message,
    });
  }
});
</script>
