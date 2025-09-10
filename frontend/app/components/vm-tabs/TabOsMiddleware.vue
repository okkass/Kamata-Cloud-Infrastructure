<template>
  <div class="space-y-4">
    <div>
      <label for="os-image" class="block mb-1.5 font-semibold text-gray-700"
        >OSイメージ</label
      >
      <select
        id="os-image"
        class="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
      >
        <option>Ubuntu 22.04</option>
        <option>Ubuntu 20.04</option>
        <option>CentOS Stream 9</option>
        <option>AlmaLinux 9</option>
      </select>
    </div>

    <div>
      <label
        for="middleware-select"
        class="block mb-1.5 font-semibold text-gray-700"
        >ミドルウェア選択</label
      >
      <select
        id="middleware-select"
        class="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
      >
        <option value="none">なし</option>
        <option value="lamp">LAMP (Apache, MySQL, PHP)</option>
        <option value="nginx">Nginx</option>
        <option value="docker">Docker</option>
      </select>
    </div>
  </div>
</template>

<script setup>
// このコンポーネントは今のところ状態やロジックを持たないため、script部分は空です
</script>
