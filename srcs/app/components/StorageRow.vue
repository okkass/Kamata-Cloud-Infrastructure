<template>
  <div class="storage-grid">
    <div class="col-span-1 text-center font-medium text-gray-600">
      {{ index + 1 }}.
    </div>
    <div class="col-span-4">
      <FormInput
        label=""
        :name="`storages[${index}].name`"
        type="text"
        :disabled="storage.type === 'backup'"
        :error="errors[`storages[${index}].name`]"
        v-model="storage.name"
      />
    </div>
    <div class="col-span-2">
      <FormInput
        label=""
        :name="`storages[${index}].size`"
        type="number"
        :disabled="storage.type === 'backup'"
        :error="errors[`storages[${index}].size`]"
        v-model.number="storage.size"
      />
    </div>
    <div class="self-center">GB</div>
    <div class="col-span-3">
      <FormSelect
        label=""
        :name="`storages[${index}].poolId`"
        :options="pools ?? []"
        placeholder="選択してください"
        :required="true"
        :placeholder-value="null"
        :pending="poolsPending"
        :error="poolsError"
        :error-message="errors[`storages[${index}].poolId`]"
        v-model="storage.poolId"
      />
    </div>
    <div class="col-span-1 flex mt-4 items-center">
      <button
        v-if="storage.type !== 'os'"
        type="button"
        @click="$emit('remove')"
        class="btn-cross-delete"
      >
        <icon-cross
          customClass="text-red-400 hover:text-red-600"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// 親から受け取るデータ
defineProps(['index', 'pools', 'errors', 'poolsPending', 'poolsError']);
// v-modelで双方向バインディング
const storage = defineModel<any>();
// 削除イベント
defineEmits(['remove']);
</script>