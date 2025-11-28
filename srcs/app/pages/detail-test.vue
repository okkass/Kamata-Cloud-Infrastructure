<template>
  <ResourceDetailShell
    title="ユーザー詳細"
    subtitle="ID: 12345"
    :tabs="vmTabs"
    :actions="userActions"
    :context="{ userId: '12345' }"
    @back="router.back()"
    @action="handleAction"
  >
  </ResourceDetailShell>
</template>

<script setup>
import { tabs as vmTabs } from "@/composables/usetabs";
import { useRouter } from "vue-router";
import ResourceDetailShell from "~/components/detail/ResourceDetailShell.vue";
import { useToast } from "@/composables/useToast";
const { addToast } = useToast();

const router = useRouter();

// 🔹 この配列をページごとに自由に変えればOK（プルダウンの中身）
const userActions = [
  { label: "起動", value: "start" },
  { label: "停止", value: "stop" },
  { label: "再起動", value: "restart" },
];

const handleAction = (action) => {
  switch (action.value) {
    case "start":
      addToast({ message: "ユーザーを起動しました", type: "success" });
      break;
    case "stop":
      console.log("ユーザーを停止します");
      break;
    case "restart":
      console.log("ユーザーを再起動します");
      break;
    default:
      console.warn("未知のアクション:", action.value);
  }
};
</script>
