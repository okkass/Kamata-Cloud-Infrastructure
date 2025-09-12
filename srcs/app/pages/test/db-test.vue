<script setup lang="ts">
// パスは実際の型定義ファイルに合わせてください

const {
  data: tests,
  pending,
  error,
} = await useFetch<Test[]>("/api/test/test");
</script>

<template>
  <div class="bg-black text-white min-h-screen p-4 sm:p-8">
    <h1 class="text-3xl font-bold mb-6">DB Test</h1>

    <div v-if="pending" class="text-yellow-400">Loading...</div>

    <div v-else-if="error" class="text-red-500">Error: {{ error.message }}</div>

    <div v-else class="rounded-lg shadow-md overflow-hidden bg-gray-900">
      <table class="min-w-full">
        <thead class="bg-gray-800">
          <tr>
            <th
              scope="col"
              class="py-3 px-6 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
            >
              ID
            </th>
            <th
              scope="col"
              class="py-3 px-6 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
            >
              Title
            </th>
            <th
              scope="col"
              class="py-3 px-6 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
            >
              Contents
            </th>
            <th
              scope="col"
              class="py-3 px-6 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
            >
              Created At
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-700">
          <tr
            v-for="test in tests"
            :key="test.id"
            class="hover:bg-gray-800 transition-colors duration-200"
          >
            <td
              class="py-4 px-6 text-sm font-medium text-white whitespace-nowrap"
            >
              {{ test.id }}
            </td>
            <td class="py-4 px-6 text-sm text-gray-300 whitespace-nowrap">
              {{ test.title }}
            </td>
            <td class="py-4 px-6 text-sm text-gray-300 whitespace-nowrap">
              {{ test.content }}
            </td>
            <td class="py-4 px-6 text-sm text-gray-300 whitespace-nowrap">
              {{ new Date(test.createdAt).toLocaleString("ja-JP") }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
