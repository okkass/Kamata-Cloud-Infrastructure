<template>
  <div>
    <div class="mb-4">
      <label for="network-name" class="block mb-1.5 font-semibold text-gray-700"
        >ネットワーク名</label
      >
      <input
        type="text"
        id="network-name"
        class="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>

    <div class="mb-4">
      <label for="ip-address" class="block mb-1.5 font-semibold text-gray-700"
        >IPアドレス / CIDR</label
      >
      <input
        type="text"
        id="ip-address"
        placeholder="例: 192.168.0.0/16"
        class="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>

    <div class="flex justify-end gap-3 mt-6">
      <button
        @click="createNetwork"
        class="py-2 px-5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
      >
        作成
      </button>
    </div>
  </div>
</template>

<script setup>
// このコンポーネントが親に通知するイベントを定義
const emit = defineEmits(["close"]);

// 「作成」ボタンが押されたときの処理
const createNetwork = () => {
  alert("「作成」ボタンがクリックされました！");
  // ここに実際のネットワーク作成処理を記述...

  // 処理が終わったら、親にモーダルを閉じるよう通知する
  emit("close");
};
</script>
