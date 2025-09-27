<template>
  <div class="p-4">
    <h1 class="mb-4 text-2xl font-bold">Toast Notification Test</h1>
    <div class="flex flex-col gap-2">
      <button
        @click="success"
        class="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
      >
        Show Success Toast
      </button>
      <button
        @click="error"
        class="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
      >
        Show Error Toast
      </button>
      <button
        @click="info"
        class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        Show Info Toast
      </button>
      <button
        @click="
          useToast().addToast({
            type: 'info',
            message: '自動で消えるトースト',
            details:
              '1秒後に自動で消えますgnerguionergnaiergniaerngilufndgiernog;naeirngi;urengiuner;gkgndkfhgm:spermgmgiwmefe;rpgmaeorgnreger',
            duration: 1000,
          })
        "
        class="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
      >
        Show Auto Dismiss Toast
      </button>
      <button
        @click="warning"
        class="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
      >
        Show Warning Toast
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { addToast } = useToast();

const success = () => {
  addToast({
    type: "success",
    message: "成功しました！",
    details: "追加の詳細情報",
  });
};
const error = () => {
  addToast({
    type: "error",
    message: "エラーが発生しました。",
    details: "追加の詳細情報",
  });
};
const info = () => {
  addToast({
    type: "info",
    message: "情報メッセージです。",
    details: "追加の詳細情報",
  });
};
const warning = () => {
  addToast({
    type: "warning",
    message: "警告メッセージです。",
    details: "追加の詳細情報",
  });
};
</script>
