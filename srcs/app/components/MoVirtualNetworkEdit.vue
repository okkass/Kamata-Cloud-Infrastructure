<template>
  <div>
    <div class="mb-6">
      <label for="network-name" class="block mb-1.5 font-semibold text-gray-700"
        >ネットワーク名</label
      >
      <input
        type="text"
        id="network-name"
        v-model="networkName"
        class="w-full p-2.5 border border-gray-300 rounded-md bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>

    <div>
      <h3 class="text-lg font-semibold text-gray-800 mb-3">サブネット一覧</h3>
      <div class="space-y-3">
        <div
          class="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-600 px-2"
        >
          <div class="col-span-4">サブネット名</div>
          <div class="col-span-4">アドレス範囲</div>
          <div class="col-span-2">外部接続</div>
          <div class="col-span-2">操作</div>
        </div>
        <div
          v-for="(subnet, index) in subnets"
          :key="subnet.id"
          class="grid grid-cols-12 gap-4 items-center"
        >
          <div class="col-span-4">
            <input
              type="text"
              v-model="subnet.name"
              class="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div class="col-span-4">
            <input
              type="text"
              v-model="subnet.cidr"
              class="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div class="col-span-2">
            <select
              v-model="subnet.external"
              class="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          <div class="col-span-2">
            <button
              @click="deleteSubnet(subnet.id)"
              class="w-full py-2 px-3 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600"
            >
              削除
            </button>
          </div>
        </div>
      </div>
      <button
        @click="addSubnet"
        class="mt-4 py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700"
      >
        ＋サブネットを追加
      </button>
    </div>

    <div class="flex justify-end mt-8">
      <button
        @click="saveChanges"
        class="py-2 px-5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700"
      >
        保存
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

// このコンポーネントが親に通知するイベントを定義
const emit = defineEmits(["close"]);

// フォームのデータ (refでリアクティブにする)
const networkName = ref("example-network");
const subnets = ref([
  { id: 1, name: "subnet-a", cidr: "192.168.1.0/24", external: "Yes" },
  { id: 2, name: "subnet-b", cidr: "192.168.2.0/24", external: "No" },
]);
let nextSubnetId = 3; // 新しいサブネット用の一意なID

// サブネットを追加する関数
const addSubnet = () => {
  subnets.value.push({
    id: nextSubnetId++,
    name: "",
    cidr: "",
    external: "No",
  });
};

// サブネットを削除する関数
const deleteSubnet = (idToDelete) => {
  subnets.value = subnets.value.filter((subnet) => subnet.id !== idToDelete);
};

// 「保存」ボタンが押されたときの処理
const saveChanges = () => {
  // 実際の保存処理...
  console.log("保存データ:", {
    networkName: networkName.value,
    subnets: subnets.value,
  });
  alert("変更を保存しました！");
  emit("close");
};
</script>
