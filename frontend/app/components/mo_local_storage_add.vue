<template>
  <div>
    <div class="mb-4">
      <label for="node-name" class="block mb-1.5 font-semibold text-gray-700"
        >ノード名</label
      >
      <select
        id="node-name"
        class="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option>ノードA</option>
        <option>ノードB</option>
      </select>
    </div>

    <div class="mb-4">
      <label for="disk-name" class="block mb-1.5 font-semibold text-gray-700"
        >ディスク名</label
      >
      <input
        type="text"
        id="disk-name"
        placeholder="例: Disk01"
        class="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>

    <div class="mb-4">
      <label
        for="recognized-disk"
        class="block mb-1.5 font-semibold text-gray-700"
        >認識ディスク</label
      >
      <select
        id="recognized-disk"
        class="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option>/dev/sda</option>
        <option>/dev/sdb</option>
      </select>
    </div>

    <div class="flex justify-end gap-3 mt-6">
      <button
        @click="addStorage"
        class="py-2 px-5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
      >
        追加
      </button>
    </div>
  </div>
</template>

<script setup>
// このコンポーネントが親に通知するイベントを定義
const emit = defineEmits(["close"]);

// 「追加」ボタンが押されたときの処理
const addStorage = () => {
  alert("「追加」ボタンがクリックされました！");
  // 実際の追加処理...
  emit("close");
};
</script>
