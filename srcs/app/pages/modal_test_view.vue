<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">仮想マシン編集モーダルテスト</h1>

    <button
      @click="isModalVisible = true"
      class="py-2 px-5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700"
    >
      仮想マシン編集モーダルを開く
    </button>

    <MoVirtualMachineEdit
      :show="isModalVisible"
      @close="isModalVisible = false"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
// Nuxt3の自動インポート機能のおかげで、下記は書かなくても動作します
import MoVirtualMachineEdit from "~/components/mo_virtual_machine_edit.vue";

// モーダルの表示/非表示を管理
const isModalVisible = ref(false);
</script>
