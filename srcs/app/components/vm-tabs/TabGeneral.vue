<template>
  <div class="space-y-4">
    <div>
      <label for="vm-name" class="block mb-1.5 font-semibold text-gray-700"
        >仮想マシン名</label
      >
      <input
        type="text"
        id="vm-name"
        class="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        placeholder="例: vm-middleware01"
      />
    </div>

    <div>
      <label for="node-select" class="block mb-1.5 font-semibold text-gray-700"
        >ノード選択</label
      >
      <select
        id="node-select"
        class="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
      >
        <option value="node1">kci-node1</option>
        <option value="node2">kci-node2</option>
        <option value="node3">kci-node3</option>
      </select>
    </div>
  </div>
</template>

<script setup>
// このコンポーネントは今のところ状態やロジックを持たないため、script部分は空です
</script>
