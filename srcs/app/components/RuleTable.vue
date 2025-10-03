<template>
  <div class="p-4 border border-gray-200 rounded-lg">
    <h3 class="section-title mb-4">{{ title }}</h3>

    <table class="w-full">
      <thead class="text-xs text-gray-600 text-left">
        <tr>
          <th class="pb-2 w-40">ルール名</th>
          <th class="pb-2 w-32">ポート番号</th>
          <th class="pb-2 w-28">プロトコル</th>
          <th class="pb-2">送信元IP</th>
          <th class="pb-2 w-28">許可/拒否</th>
          <th class="pb-2 w-12"></th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="rule in rules"
          :key="rule.id"
          class="border-t border-gray-200"
        >
          <td class="py-2 align-middle">
            <input type="text" v-model="rule.name" class="table-input" />
          </td>
          <td class="py-2 align-middle">
            <input type="text" v-model="rule.port" class="table-input" />
          </td>
          <td class="py-2 align-middle">
            <select v-model="rule.protocol" class="table-input">
              <option>TCP</option>
              <option>UDP</option>
              <option>ICMP</option>
            </select>
          </td>
          <td class="py-2 align-middle">
            <input type="text" v-model="rule.sourceIp" class="table-input" />
          </td>
          <td class="w-3 h-3 py-2 align-middle">
            <select v-model="rule.action" class="table-input">
              <option>許容</option>
              <option>拒否</option>
            </select>
          </td>
          <td class="py-2 text-center align-middle">
            <SecondaryButton
              @click="$emit('delete-rule', rule.id)"
              class="w-8 h-8 !p-0 flex items-center justify-center !rounded-full"
            >
              &times;
            </SecondaryButton>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="mt-4">
      <button @click="$emit('add-rule')" class="btn-add-rule">
        + ルールを追加
      </button>
    </div>
  </div>
</template>

<script setup>
// このコンポーネントは受け取ったデータを表示・編集し、イベントを親に通知するだけ
defineProps({
  title: String,
  rules: Array,
});
defineEmits(["add-rule", "delete-rule"]);
</script>

<style scoped>
.section-title {
  @apply font-semibold text-gray-800;
}
.table-input {
  @apply w-full p-2 border border-gray-300 rounded-md;
}
.btn-add-rule {
  @apply text-sm bg-blue-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-600;
}
</style>
