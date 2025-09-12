<template>
  <div
    v-if="show"
    @click.self="$emit('close')"
    class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
  >
    <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
      <div
        class="flex justify-between items-center border-b border-gray-200 pb-4 mb-4"
      >
        <h2 class="text-xl font-bold text-gray-800">{{ title }}</h2>
        <button
          @click="$emit('close')"
          class="text-3xl text-gray-500 hover:text-gray-800"
        >
          &times;
        </button>
      </div>

      <div class="modal-body">
        <component :is="contentComponent" @close="$emit('close')" />
      </div>
    </div>
  </div>
</template>

<script setup>
// 親コンポーネントから受け取るデータ (props) を定義
defineProps({
  show: { type: Boolean, required: true },
  title: { type: String, default: "モーダル" },
  contentComponent: { type: Object, required: true },
});

// 親コンポーネントに伝えるイベント (emits) を定義
defineEmits(["close"]);
</script>
