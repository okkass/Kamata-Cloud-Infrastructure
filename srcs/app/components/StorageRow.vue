<template>
  <tr class="align-top">
    <td class="px-1 py-2 text-center font-medium text-gray-600 pt-5">
      {{ index + 1 }}.
    </td>
    <td class="px-1 py-2">
      <FormInput
        label=""
        name="storage-name"
        :disabled="storage.type === 'backup'"
        :error="errors[`storages[${index}].name`]"
        v-model="storage.name"
      />
    </td>
    <td class="px-1 py-2">
      <div class="flex items-start">
        <FormInput
          label=""
          name="storage-size"
          type="number"
          class="rounded-r-none"
          :disabled="storage.type === 'backup'"
          :error="errors[`storages[${index}].size`]"
          v-model.number="storage.size"
        />
        <div class="form-unit-label">GB</div>
      </div>
    </td>
    <td class="px-1 py-2">
      <FormSelect
        label=""
        name="storage-pool"
        :options="pools ?? []"
        placeholder="選択してください"
        :required="true"
        :placeholder-value="null"
        :pending="poolsPending"
        :error="poolsError"
        :error-message="errors[`storages[${index}].poolId`]"
        v-model="storage.poolId"
      />
    </td>
    <td class="px-1 py-2 pt-5">
      <button
        v-if="storage.type !== 'os'"
        type="button"
        @click="$emit('remove')"
        class="btn-cross-delete"
      >
        <IconCross custom-class="h-5 w-5" />
      </button>
    </td>
  </tr>
</template>

<script setup lang="ts">
// script部分は変更なし
defineProps(["index", "pools", "errors", "poolsPending", "poolsError"]);
const storage = defineModel<any>();
defineEmits(["remove"]);
</script>
