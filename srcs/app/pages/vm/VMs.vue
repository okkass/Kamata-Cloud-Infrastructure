<!-- pages/vm/VMs.vue -->
<template>
  <div>
    <DashboardLayout
      title="仮想マシンダッシュボード"
      :columns="columns"
      :rows="rows"
      rowKey="id"
      :headerButtons="headerButtons"
      :rowActions="rowActions"
      @header-action="onHeader"
      @row-action="onRow"
    />

    <!-- 新規作成モーダル -->
    <MoImageAdd
      :show="showMoImageAdd"
      @close="showMoImageAdd = false"
      @submitted="handleSubmitted"
    />
  </div>
</template>

<script>
import DashboardLayout from "@/components/DashboardLayout.vue";
import MoImageAdd from "~/components/MoImageAdd.vue"; // ← コンポーネント配置に合わせて

export default {
  name: "VMs",
  components: { DashboardLayout, MoImageAdd },
  data() {
    return {
      showMoImageAdd: false,
      columns: [
        { key: "name", label: "仮想マシン名" },
        { key: "network", label: "所属ネットワーク" },
        { key: "cpu", label: "CPU使用率" },
        { key: "memory", label: "メモリ使用率" },
        { key: "status", label: "状態" },
      ],
      rows: [
        {
          id: 1,
          name: "vm-kamata01",
          network: "student-net",
          cpu: "55%",
          memory: "62%",
          status: "稼働中",
        },
        {
          id: 2,
          name: "vm-kamata02",
          network: "dev-net",
          cpu: "—",
          memory: "—",
          status: "停止中",
        },
        {
          id: 3,
          name: "vm-kamata03",
          network: "lab-net",
          cpu: "33%",
          memory: "47%",
          status: "稼働中",
        },
      ],
      headerButtons: [{ label: "仮想マシン新規作成", action: "create-vm" }],
      rowActions: [
        { label: "詳細", action: "detail" },
        { label: "編集", action: "edit" },
        { label: "削除", action: "delete" },
      ],
    };
  },
  methods: {
    onHeader(action) {
      if (action === "create-vm") this.showMoImageAdd = true;
    },
    onRow({ action, row }) {
      alert(`${action}: ${row.name}`);
    },
    handleSubmitted(payload) {
      console.log("submitted:", payload);
      this.showMoImageAdd = false;
    },
  },
};
</script>
