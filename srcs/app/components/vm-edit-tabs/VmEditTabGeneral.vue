<template>
  <div class="p-6">
    <div class="max-w-xl">
      <FormInput
        label="名前"
        name="name"
        v-model="model.name"
        :error="errors?.name"
        placeholder="例: web-server-01"
        required
        class="w-full"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import FormInput from "~/components/Form/Input.vue"; // パスは環境に合わせて調整してください

/**
 * 親コンポーネント (MoVirtualMachineEdit) から v-model で編集用データを受け取ります。
 * useResourceUpdater で管理されている editedData がここに入ります。
 */
const model = defineModel<any>({ required: true });
defineProps<{
  errors?: { name?: string };
}>();
</script>
