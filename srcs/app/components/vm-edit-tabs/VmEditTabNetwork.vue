<template>
  <div class="space-y-6">
    <div class="form-section space-y-4">
      <h3 class="section-title">ネットワーク</h3>

      <div>
        <label for="network-select" class="form-label-sm">ネットワーク</label>
        <select
          id="network-select"
          v-model="selectedNetwork"
          class="form-input"
        >
          <option>student-net</option>
          <option>teacher-net</option>
        </select>
      </div>

      <div>
        <label for="subnet-select" class="form-label-sm">サブネット</label>
        <select id="subnet-select" v-model="selectedSubnet" class="form-input">
          <option>192.168.10.0/24</option>
          <option>172.16.0.0/24</option>
        </select>
      </div>
    </div>

    <div class="form-section">
      <h3 class="section-title mb-4">セキュリティグループ</h3>

      <table class="w-full text-sm text-left text-gray-700">
        <thead class="text-xs text-gray-800 uppercase bg-gray-100">
          <tr>
            <th class="px-4 py-2">グループ名</th>
            <th class="px-4 py-2">説明</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="appliedGroups.length === 0">
            <td colspan="2" class="text-center py-4 text-gray-500">
              適用中のセキュリティグループはありません
            </td>
          </tr>
          <tr
            v-for="group in appliedGroups"
            :key="group.name"
            class="bg-white border-b"
          >
            <td class="px-4 py-2 font-medium">{{ group.name }}</td>
            <td class="px-4 py-2">{{ group.description }}</td>
          </tr>
        </tbody>
      </table>

      <div class="flex items-center gap-3 mt-4">
        <select v-model="selectedGroupToAdd" class="form-input flex-grow">
          <option :value="null" disabled>追加するグループを選択</option>
          <option
            v-for="group in availableGroups"
            :key="group.name"
            :value="group.name"
          >
            {{ group.name }}
          </option>
        </select>
        <button @click="addGroup" class="btn-secondary">追加</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

// 親コンポーネントから渡される、編集対象のVMのネットワークデータ
const props = defineProps({
  networkData: {
    type: Object,
    required: true,
    // データが渡されない場合のデフォルト値（テスト用）
    default: () => ({
      network: "student-net",
      subnet: "192.168.10.0/24",
      securityGroups: [
        { name: "default", description: "デフォルトのセキュリティグループ" },
      ],
    }),
  },
});

// フォームの入力値を、propsで受け取ったデータで初期化
const selectedNetwork = ref(props.networkData.network);
const selectedSubnet = ref(props.networkData.subnet);
const appliedGroups = ref(
  JSON.parse(JSON.stringify(props.networkData.securityGroups))
);

// プルダウンに表示する、追加可能なグループのリスト（ダミーデータ）
const availableGroups = ref([
  { name: "default", description: "デフォルトのセキュリティグループ" },
  { name: "web-server", description: "Webサーバー用のセキュリティグループ" },
  { name: "allow-http", description: "HTTP通信を許可" },
  { name: "allow-ssh", description: "SSH接続を許可" },
]);
// プルダウンで選択されているグループ
const selectedGroupToAdd = ref(null);

// セキュリティグループを追加する関数
const addGroup = () => {
  if (!selectedGroupToAdd.value) {
    alert("追加するグループを選択してください。");
    return;
  }
  const groupObject = availableGroups.value.find(
    (g) => g.name === selectedGroupToAdd.value
  );
  const isAlreadyAdded = appliedGroups.value.some(
    (g) => g.name === selectedGroupToAdd.value
  );

  if (groupObject && !isAlreadyAdded) {
    appliedGroups.value.push(groupObject);
  } else if (isAlreadyAdded) {
    alert("このグループは既に追加されています。");
  }
};
</script>

<style scoped>
/* 既存のフォームスタイルを再利用 */
.form-section {
  @apply p-4 border border-gray-200 rounded-lg;
}
.section-title {
  @apply font-semibold text-gray-800;
}
.form-label-sm {
  @apply block mb-1.5 text-sm font-medium text-gray-600;
}
.form-input {
  @apply w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500;
}
.btn-secondary {
  @apply py-2 px-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 whitespace-nowrap;
}
</style>
