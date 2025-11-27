<template>
  <ResourceDetailShell
    title="サーバー詳細"
    subtitle="基本情報"
    :context="{
      id: 'dummy-id',
      region: 'dummy-region',
    }"
    :actions="actions"
    @back="handleBack"
    @action="handleAction"
  />
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import ResourceDetailShell from "~/components/detail/ResourceDetailShell.vue";
import { useToast } from "@/composables/useToast";
const { addToast } = useToast();

const router = useRouter();

// 🔹 この配列をページごとに自由に変えればOK（プルダウンの中身）
const actions = [
  { label: "起動", value: "start" },
  { label: "停止", value: "stop" },
  { label: "再起動", value: "restart" },
];

const handleBack = () => {
  // URL遷移したいならここで。例:
  router.back();
  // or router.push("/servers");
};

const handleAction = (action: { label: string; value: string }) => {
  console.log("選択されたアクション:", action);
  // ここに「起動API叩く」「モーダル出す」などの処理を書く
};
</script>
